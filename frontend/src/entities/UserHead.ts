export interface UserHeadDTO {
  id: number;
  accountId: string,
  fullName: string;
  shortName: string;
  firstName: string;
  surname: string;
}

export class UserHead {
  id: number
  accountId: string
  fullName: string
  shortName: string
  firstName: string
  surname: string

  constructor(dto: UserHeadDTO) {
    this.id = dto.id
    this.accountId = dto.accountId
    this.fullName = dto.fullName
    this.shortName = dto.shortName
    this.firstName = dto.firstName
    this.surname = dto.surname
  }
}
