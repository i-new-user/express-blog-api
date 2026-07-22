export class CreateUserDto {
  login!: string;
  password!: string;
  email!: string;
}

export class UsersQueryDto {
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  pageNumber?: string;
  pageSize?: string;
  searchLoginTerm?: string;
  searchEmailTerm?: string;
}
