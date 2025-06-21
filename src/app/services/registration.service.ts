import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RegistrationService {
  private email: string = '';

  /**
   * sets the current email
   * 
   * @param email 
   */
  setEmail(email: string) {
    this.email = email;
  }

  /**
   * gets the current email
   * 
   * @returns the email
   */
  getEmail(): string {
    return this.email;
  }

  /**
   * clears the email
   */
  clear() {
    this.email = '';
  }
}
