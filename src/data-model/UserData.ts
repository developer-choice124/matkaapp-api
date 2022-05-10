export interface NewUser {
    username:string;
    name:string;
    password: any;
    role: string;
    is_active:boolean;
    is_first_login: boolean;
    created_at:Date;
    updated_at:Date;
    commission: string;
    parent_id: string;
    chips:number;
    number:number
}

export interface UserLogin {
    username: string,
    password: string
}
export interface ChangePassword {
    user_id: string,
    newpassword: string,
    cnewpassword: string,
    is_first_login: boolean,
}

export interface UserSetting {
    user_id: string,
    language: string
}