package org.finos.objectbuilder;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;
import com.google.common.collect.Streams;
import com.google.inject.Inject;
import com.regnosys.rosetta.RosettaStandaloneSetup;
import com.regnosys.rosetta.common.serialisation.RosettaObjectMapper;
import com.regnosys.rosetta.common.util.ClassPathUtils;
import com.regnosys.rosetta.generator.java.enums.EnumHelper;
import com.regnosys.rosetta.rosetta.RosettaEnumValue;
import com.regnosys.rosetta.rosetta.RosettaEnumeration;
import com.regnosys.rosetta.rosetta.RosettaModel;
import com.regnosys.rosetta.rosetta.RosettaNamed;
import com.regnosys.rosetta.rosetta.simple.AnnotationRef;
import com.regnosys.rosetta.rosetta.simple.Attribute;
import com.regnosys.rosetta.rosetta.simple.Data;
import com.regnosys.rosetta.types.*;
import com.regnosys.rosetta.types.builtin.RBasicType;
import com.regnosys.rosetta.types.builtin.RRecordType;
import org.eclipse.emf.common.util.EList;
import org.eclipse.emf.common.util.URI;
import org.eclipse.emf.ecore.resource.Resource;
import org.eclipse.xtext.resource.XtextResourceSet;

import javax.inject.Provider;
import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;
import java.util.stream.Collectors;

public class TypescriptObjectBuilderModelGenerator {

    public static final String ROOT_TYPE = "rootType";

    @Inject
    private Provider<XtextResourceSet> resourceSetProvider;

    @Inject
    private TypeSystem typeSystem;

    private final List<RosettaModel> rosettaModels;

    public TypescriptObjectBuilderModelGenerator() throws MalformedURLException {
        new RosettaStandaloneSetup().createInjectorAndDoEMFRegistration().injectMembers(this);
        rosettaModels = loadModels();
    }

    private List<RosettaModel> loadModels() throws MalformedURLException {
        XtextResourceSet resourceSet = resourceSetProvider.get();
        List<Path> rosettaFilePaths = ClassPathUtils.findRosettaFilePaths();
        for (Path rosettaFilePath : rosettaFilePaths) {
            resourceSet.getResource(URI.createURI(rosettaFilePath.toUri().toURL()
                    .toString(), true), true);
        }

        return resourceSet.getResources().stream()
                .map(Resource::getContents)
                .flatMap(Collection::stream)
                .map(RosettaModel.class::cast)
                .collect(Collectors.toList());
    }

    public List<StructuredType> rootTypes() {
        return allDataTypes().stream()
                .filter(x -> x.getAnnotations().stream().anyMatch(r -> r.getAnnotation().getName().equals(ROOT_TYPE)))
                .map(this::createStructuredType)
                .collect(Collectors.toList());
    }

    public Map<String, List<ModelAttribute>> allAttributesFromRoots() {
        Map<String, List<ModelAttribute>> map = new HashMap<>();
        List<Data> allTypes = allDataTypes();

        for (Data dataType : allTypes) {
            map.put(dataType.getModel()
                    .getName() + "." + dataType.getName(), getModelAttributeForType(dataType));
        }
        return map;
    }

    private List<Data> allDataTypes() {
        return rosettaModels.stream()
                .map(RosettaModel::getElements)
                .flatMap(Collection::stream)
                .filter(Data.class::isInstance)
                .map(Data.class::cast)
                .collect(Collectors.toList());
    }

    private List<Attribute> getDataAttributes(Data data) {
        Data superType = data.getSuperType();
        if (superType == null) {
            return data.getAttributes();
        }
        List<Attribute> dataAttributes = getDataAttributes(superType);
        return Streams.concat(data.getAttributes().stream(), dataAttributes.stream()).collect(Collectors.toList());
    }

    public List<ModelAttribute> getModelAttributeForType(Data type) {
        List<ModelAttribute> modelAttributes = new ArrayList<>();

        List<Attribute> attributes = getDataAttributes(type);

        for (Attribute attribute : attributes) {
            Cardinality cardinality = new Cardinality(attribute.getCard().getInf() + "", attribute.getCard()
                    .isUnbounded() ? "*" : attribute.getCard().getSup() + "");

            RType rType = typeSystem.stripFromTypeAliases(typeSystem.typeCallToRType(attribute.getTypeCall()));
            boolean isMetaField = attribute
                    .getAnnotations()
                    .stream()
                    .map(AnnotationRef::getAnnotation)
                    .map(RosettaNamed::getName)
                    .anyMatch(x -> x.equals("metadata"));
            if (rType instanceof RDataType) {
                ModelAttribute modelAttribute = new ModelAttribute(attribute.getName(), createStructuredType(((RDataType) rType).getEObject()), attribute.getDefinition(), cardinality, isMetaField);
                modelAttributes.add(modelAttribute);
            }

            if (rType instanceof RChoiceType) {
                ModelAttribute modelAttribute = new ModelAttribute(attribute.getName(), createStructuredType(((RChoiceType) rType).getEObject()), attribute.getDefinition(), cardinality, isMetaField);
                modelAttributes.add(modelAttribute);
            }

            if (rType instanceof RBasicType || rType instanceof RRecordType) {
                RosettaBasicType rosettaBasicType = RosettaBasicType.find(rType.getName());
                ModelAttribute modelAttribute = new ModelAttribute(attribute.getName(), rosettaBasicType, attribute.getDefinition(), cardinality, isMetaField);
                modelAttributes.add(modelAttribute);
            }

            if (rType instanceof REnumType rEnumType) {
                RosettaEnumeration enumAttributeType = rEnumType.getEObject();

                List<RosettaEnumValue> enumValues = getRosettaEnumValues(enumAttributeType);
                List<EnumTypeValue> values = enumValues.stream()
                        .map(x -> new EnumTypeValue(EnumHelper.formatEnumName(x.getName()), generateDisplayName(x), x.getDefinition()))
                        .collect(Collectors.toList());
                EnumType enumType = new EnumType(enumAttributeType.getName(), RosettaTypeCategory.EnumType, values);
                ModelAttribute modelAttribute = new ModelAttribute(attribute.getName(), enumType, attribute.getDefinition(), cardinality, isMetaField);
                modelAttributes.add(modelAttribute);
            }
        }
        return modelAttributes;
    }


    private List<RosettaEnumValue> getRosettaEnumValues(RosettaEnumeration rosettaEnumeration) {
        RosettaEnumeration superType = rosettaEnumeration.getParent();
        if (superType == null) {
            return rosettaEnumeration.getEnumValues();
        }
        List<RosettaEnumValue> superTypeEnumValues = getRosettaEnumValues(superType);
        return Streams.concat(rosettaEnumeration.getEnumValues().stream(), superTypeEnumValues.stream()).collect(Collectors.toList());
    }

    private String generateDisplayName(RosettaEnumValue x) {
        return x.getDisplay() == null || x.getDisplay().isBlank() ? x.getName() : x.getDisplay();
    }

    private StructuredType createStructuredType(com.regnosys.rosetta.rosetta.RosettaType type) {
        return new StructuredType(RosettaTypeCategory.StructuredType, type.getName(), type.getModel()
                .getName(), ((Data) type).getDefinition());
    }

    static class RosettaType {
        RosettaTypeCategory typeCategory;

        public RosettaType(RosettaTypeCategory typeCategory) {
            this.typeCategory = typeCategory;
        }


        public RosettaTypeCategory getTypeCategory() {
            return typeCategory;
        }
    }

    public enum RosettaTypeCategory {
        EnumType, StructuredType;
    }

    public enum RosettaBasicType {
        STRING("string"),
        INT("int"),
        NUMBER("number"),
        BOOLEAN("boolean"),
        TIME("time"),
        DATE("date"),
        DATE_TIME("dateTime"),
        ZONED_DATE_TIME("zonedDateTime"),
        ;

        private String name;

        RosettaBasicType(String name) {
            this.name = name;
        }

        public static RosettaBasicType find(String name) {
            return Arrays.stream(values()).filter(x -> x.name.equals(name)).findFirst()
                    .orElseThrow(() -> new IllegalStateException("no basic type with " + name + " found"));
        }

        @Override
        public String toString() {
            return name;
        }
    }


    public static class StructuredType extends RosettaType {
        String name;
        String namespace;
        String description;

        public StructuredType(RosettaTypeCategory typeCategory, String name, String namespace, String description) {
            super(typeCategory);
            this.name = name;
            this.namespace = namespace;
            this.description = description;
        }

        public String getName() {
            return name;
        }

        public String getNamespace() {
            return namespace;
        }

        public String getDescription() {
            return description;
        }
    }

    public static class EnumType extends RosettaType {
        String name;
        List<EnumTypeValue> values;

        public EnumType(String name, RosettaTypeCategory typeCategory, List<EnumTypeValue> values) {
            super(typeCategory);
            this.name = name;
            this.values = values;
        }

        public String getName() {
            return name;
        }

        public List<EnumTypeValue> getValues() {
            return values;
        }
    }

    public static class EnumTypeValue {
        String name;
        private String displayName;
        String description;

        public EnumTypeValue(String name, String displayName, String description) {
            this.name = name;
            this.displayName = displayName;
            this.description = description;
        }

        public String getName() {
            return name;
        }

        public String getDescription() {
            return description;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

    public static class ModelAttribute {
        String name;
        Object type; // RosettaBasicType | EnumType | StructuredType
        String description;
        Cardinality cardinality;
        boolean isMetaField;

        public ModelAttribute(String name, RosettaBasicType type, String description, Cardinality cardinality, boolean isMetaField) {
            this.name = name;
            this.type = type;
            this.description = description;
            this.cardinality = cardinality;
            this.isMetaField = isMetaField;
        }

        public ModelAttribute(String name, EnumType type, String description, Cardinality cardinality, boolean isMetaField) {
            this.name = name;
            this.type = type;
            this.description = description;
            this.cardinality = cardinality;
            this.isMetaField = isMetaField;
        }

        public ModelAttribute(String name, StructuredType type, String description, Cardinality cardinality, boolean isMetaField) {
            this.name = name;
            this.type = type;
            this.description = description;
            this.cardinality = cardinality;
            this.isMetaField = isMetaField;
        }


        public String getName() {
            return name;
        }

        public Object getType() {
            return type;
        }

        public String getDescription() {
            return description;
        }

        public Cardinality getCardinality() {
            return cardinality;
        }

        public boolean isMetaField() {
            return isMetaField;
        }
    }

    public static class Cardinality {
        String upperBound;
        String lowerBound;

        public Cardinality(String lowerBound, String upperBound) {
            this.upperBound = upperBound;
            this.lowerBound = lowerBound;
        }

        public String getUpperBound() {
            return upperBound;
        }

        public String getLowerBound() {
            return lowerBound;
        }
    }

    public String modelVersion(String groupId, String artifactId) throws IOException {
        InputStream inputStream = this.getClass()
                .getResourceAsStream("/META-INF/maven/" + groupId + "/" + artifactId + "/pom.properties");
        Properties properties = new Properties();
        properties.load(inputStream);
        return properties.getProperty("version");
    }

    public static void main(String[] args) throws IOException {
        if (args.length != 3) {
            System.out.println("Usage: TypescriptObjectBuilderModelGenerator <output file> <groupId> <modelName>");

            System.out.println("E.G. >: TypescriptObjectBuilderModelGenerator ../ui/src/app/modules/builder/services/builder-api.model.ts org.finos.cdm cdm-java");
            System.exit(1);
        }

        var outputFile = args[0]; //../ui/src/app/modules/builder/services/builder-api.model.ts
        var groupId =  args[1]; //"org.finos.cdm";
        var modelName = args[2]; // "cdm-java";

        TypescriptObjectBuilderModelGenerator typescriptObjectBuilderModelGenerator = new TypescriptObjectBuilderModelGenerator();

        List<StructuredType> structuredTypes = typescriptObjectBuilderModelGenerator.rootTypes();

        ObjectMapper objectMapper = RosettaObjectMapper.getNewRosettaObjectMapper();

        ObjectWriter objectWriter = objectMapper.writerWithDefaultPrettyPrinter();
        StringBuilder outString = new StringBuilder();

        outString.append("export const modelName = \"").append(modelName).append("\";");
        outString.append(System.lineSeparator());

        outString.append("export const modelVersion = \"").append(typescriptObjectBuilderModelGenerator.modelVersion(groupId, modelName)).append("\";");
        outString.append(System.lineSeparator());

        outString.append("export const rootTypesJson = ").append(objectWriter.writeValueAsString(structuredTypes)).append(";");
        outString.append(System.lineSeparator());

        Map<String, List<ModelAttribute>> map = typescriptObjectBuilderModelGenerator.allAttributesFromRoots();
        outString.append("export const attributesJson = ").append(objectWriter.writeValueAsString(map)).append(";");
        outString.append(System.lineSeparator());

        Path of = Path.of(outputFile);
        Files.writeString(of, outString.toString());
    }
}
