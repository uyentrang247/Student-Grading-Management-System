import { Component, OnInit } from '@angular/core';

import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';

import { CommonModule } from '@angular/common';

import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent implements OnInit {

  loginForm!: FormGroup;

  showPassword = false;

  constructor(
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {

    this.buildForm();

  }

  buildForm(): void {

    this.loginForm = this.fb.group({

      username: ['', Validators.required],

      password: ['', Validators.required],

      rememberMe: [false]

    });

  }

  togglePassword(): void {

    this.showPassword = !this.showPassword;

  }

  onLogin(): void {

    if (this.loginForm.invalid) {

      this.loginForm.markAllAsTouched();

      return;

    }

    console.log(this.loginForm.value);

  }

  onGoogleLogin(): void {

    console.log('Google login click');

  }

}