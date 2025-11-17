import { AddressDoc } from "@/types/database";

export class AddressClientService {
  static getAddressUsername(addressInfo: AddressDoc): string | null {
    return (
      addressInfo.ens?.name ||
      addressInfo.openSea?.osUsername ||
      addressInfo.zora?.zoraUsername ||
      null
    );
  }
}
