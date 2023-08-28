import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class IdentityService {
  private id: number = 0;
  constructor() {}

  getId(): number {
    return ++this.id;
  }
}
