import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
} from '@angular/core';
import { BuilderApiService } from '../../services/builder-api.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainComponent {
  $modelName = this.builderApiService.getModelName();
  $modelVersion = this.builderApiService.getModelVersion();

  constructor(private builderApiService: BuilderApiService) {}
}
