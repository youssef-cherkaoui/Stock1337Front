export interface Person {
  id?: number;
  name: string;
  email: string;
  role : 'ADMIN' | 'USER';
}

export interface AuthenticationResponse {
  token: string;
  user : Person;
}


export interface AuthenticationRequest {
  email: string;
  password: string;
}
