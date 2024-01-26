import * as fcl from "@onflow/fcl";
// @ts-ignore
import * as type from "@onflow/types";
import Sha3 from "js-sha3";

// language=Cadence
const lookupDomainByFlownsNameHashSource = `
import Domains from 0xFlownsAddress

// Source: https://github.com/flowns-org/flow-name-service-contracts/blob/main/cadence/scripts/query_domain_info.cdc
pub fun main(nameHash: String): Domains.DomainDetail? {
  let address = Domains.getRecords(nameHash) ?? panic("Domain not exist")
  let account = getAccount(address)
  let collectionCap = account.getCapability<&{Domains.CollectionPublic}>(Domains.CollectionPublicPath)
  let collection = collectionCap.borrow()!
  var detail: Domains.DomainDetail? = nil

  let id = Domains.getDomainId(nameHash)
  if id != nil && !Domains.isDeprecated(nameHash: nameHash, domainId: id!) {
    let domain = collection.borrowDomain(id: id!)
    detail = domain.getDetail()
  }

  return detail
}
`;

// language=Cadence
const resolveAddressToFindNameCadence = `
import FIND, Profile from 0xFindAddress

pub fun main(address: Address) :  String? {
    return FIND.reverseLookup(address)
}
`

// language=Cadence
const lookupProfileByFindNameSource = `
import FIND, Profile from 0xFindAddress

pub fun main(name: String): Profile.UserProfile? {
    return FIND.lookup(name)?.asProfile()
}
`;

export type FindLink = {
  url: string;
  title: string;
  type: string;
};

export type FindWalletProfile = {
  name: string;
  balance: number;
  accept: string;
  tags: string[];
};

export type FindFriendStatus = {
  follower: string;
  following: String;
  tags: string[];
};

// https://github.com/findonflow/find/blob/main/contracts/Profile.cdc
export type FindUserProfile = {
  findName: string;
  createdAt: string;
  address: string;
  name: string;
  gender: string;
  description: string;
  tags: string[];
  avatar: string;
  links: FindLink[];
  wallets: FindWalletProfile[];
  following: FindFriendStatus[];
  followers: FindFriendStatus[];
  allowStoringFollowers: boolean;
};

// https://github.com/flowns-org/flow-name-service-contracts/blob/main/cadence/contracts/Domains.cdc
export type FlownsDomainDetail = {
  id: string;
  // Address of the owner account.
  owner: string;
  name: string;
  nameHash: string;
  addresses: Record<number, string>;
  texts: Record<number, string>;
  parentName: string;
  // Timestamp of the expiration
  expiredAt: string;
  // Timestamp of the creation date.
  createdAt: string;
};

type RawNameMetadata = {
  flowns: FlownsDomainDetail | null;
  find: FindUserProfile | null;
}

export type FlowNameMetadata = RawNameMetadata & {
  address: string;
  domainName: string;
  twitterUrl?: string;
  websiteUrl?: string;
  name?: string;
  description?: string;
  avatar?: string;
  tags?: string[];
};

type Config = {
  findAddress: string;
  flownsAddress: string;
}

export class FlowNamesService {
  constructor(config: Config) {
    fcl.config()
      .put("0xFlownsAddress", config.flownsAddress)
      // @ts-ignore
      .put("0xFindAddress", config.findAddress);
  }

  public async getMetadataByAddress(address: string): Promise<FlowNameMetadata | undefined> {
    const name = await this.resolveAddressToFindName(address);

    if (!name) {
      return undefined;
    }

    return this.getMetadataByName(name);
  }

  public async getMetadataByName(
    name: string
  ): Promise<FlowNameMetadata | undefined> {
    const rawMetadata = await this.getRawInfosByName(name);

    const {find, flowns} = rawMetadata;

    if (!find && !flowns) {
      return undefined;
    }

    // TODO: What are the supported link types?
    const twitterLink = find?.links.find((link) => link.type === "twitter");
    const websiteLink = find?.links.find((link) => link.type === "globe");

    return {
      address: find?.address ?? flowns?.owner!,
      domainName: find?.findName ?? flowns?.name!,
      name: find?.name ?? flowns?.name,
      avatar: find?.avatar,
      // TODO: Read from flowns text records
      twitterUrl: twitterLink?.url,
      websiteUrl: websiteLink?.url,
      tags: find?.tags,
      description: find?.description,
      ...rawMetadata,
    };
  }

  public async getRawInfosByName(name: string): Promise<RawNameMetadata> {
    const [flownsResponse, findResponse] = await Promise.allSettled([
      this.lookupDomainByFlownsName(name),
      this.lookupProfileByFindName(name),
    ]);

    return {
      flowns:
        flownsResponse.status === "fulfilled" ? flownsResponse.value : null,
      find: findResponse.status === "fulfilled" ? findResponse.value : null,
    };
  }

  private async resolveAddressToFindName(address: string): Promise<string | undefined> {
    const response = await fcl
      .send([
        fcl.script(resolveAddressToFindNameCadence),
        fcl.args([fcl.arg(address, type.Address)])
      ]);
    return fcl.decode(response);
  }

  private async lookupDomainByFlownsName(name: string): Promise<FlownsDomainDetail> {
    const nameHash = this.flownsNameHash(this.addPostfixIfMissing(name, ".fn"));
    const response = await fcl
      .send([
        fcl.script(lookupDomainByFlownsNameHashSource),
        fcl.args([fcl.arg(nameHash, type.String)])
      ]);
    return fcl.decode(response);
  }

  private addPostfixIfMissing(text: string, postfix: string) {
    if (text.endsWith(postfix)) {
      return text;
    } else {
      return text + postfix;
    }
  }

  private async lookupProfileByFindName(name: string): Promise<FindUserProfile> {
    const response = await fcl
      .send([
        fcl.script(lookupProfileByFindNameSource),
        fcl.args([fcl.arg(this.addPostfixIfMissing(name, ".find"), type.String)])
      ]);

    return fcl.decode(response);
  }

  // Source: https://github.com/flowns-org/flow-name-service-contracts/blob/main/utils/hash.js
  private flownsNameHash(domainName: string) {
    const sha3 = Sha3.sha3_256;
    // Reject empty names:
    let node = "";
    for (let i = 0; i < 32; i++) {
      node += "00";
    }
    if (domainName) {
      let labels = domainName.split(".");

      for (let i = labels.length - 1; i >= 0; i--) {
        let labelSha = sha3(labels[i]);
        node = sha3(node + labelSha);
      }
    }

    return "0x" + node;
  }
}
