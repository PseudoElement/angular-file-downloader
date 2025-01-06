import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface User {
    email: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly _user$ = new BehaviorSubject<User | null>({ email: 'bubamainer@mail.ru' });

    public readonly user$ = this._user$.asObservable();

    public get user(): User | null {
        return this._user$.value;
    }

    constructor() {}

    public setUserEmail(email: string): void {
        this._user$.next({ email });
    }
}
