import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class IdentityServiceMock {
  getId(): number {
    return 12345;
  }
}
