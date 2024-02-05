import * as fcl from "@onflow/fcl";
// @ts-ignore
import * as type from "@onflow/types";
import Sha3 from "js-sha3";
import { FlowNetworkId } from "./flow-utils";

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

// https://contractbrowser.com/A.1b3930856571a52b.DomainUtils
// language=Cadence
const resolveAddressToFlowDomains = `
import DomainUtils from 0xDomainUtils

pub fun main(address: Address): {String: String} {
  return DomainUtils.getDefaultDomainsOfAddress(address)
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

export type FlowNameProfile = {
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
  networkId: FlowNetworkId
}

export class FlowNamesService {
  constructor(config: Config) {
    const findAddressByNetworkId = new Map<FlowNetworkId, string>([
      ["mainnet", "0x097bafa4e0b48eef"],
      ["testnet", "0afe396ebc8eee65"]
    ]);

    const flownsAddressByNetworkId = new Map<FlowNetworkId, string>([
      ["mainnet", "0x233eb012d34b0070"],
      ["testnet", "0xb05b2abb42335e88"]
    ]);

    const domainUtilsAddressByNetworkId = new Map<FlowNetworkId, string>([
      ["mainnet", "0x1b3930856571a52b"],
      ["testnet", "0xbca26f5091cd39ec"]
    ])

    fcl.config()
      .put("0xFlownsAddress", flownsAddressByNetworkId.get(config.networkId))
      // @ts-ignore
      .put("0xDomainUtils", domainUtilsAddressByNetworkId.get(config.networkId))
      // @ts-ignore
      .put("0xFindAddress", findAddressByNetworkId.get(config.networkId));
  }

  public async getProfilesByAddress(address: string): Promise<FlowNameProfile[]> {
    const namesLookup = await this.resolveAddressToFlowNames(address);

    if (Object.entries(namesLookup).length === 0) {
      return [];
    }

    const {find, flowns} = namesLookup;

    const metadata = await Promise.all([
      this.getProfileByFindName(find),
      this.getProfileByFlownsName(flowns),
    ]);

    return metadata.filter(Boolean) as FlowNameProfile[];
  }

  private async resolveAddressToFlowNames(address: string): Promise<Record<string, string>> {
    const response = await fcl
      .send([
        fcl.script(resolveAddressToFlowDomains),
        fcl.args([fcl.arg(address, type.Address)])
      ]);
    return fcl.decode(response);
  }

  private async getProfileByFindName(name: string): Promise<FlowNameProfile | undefined> {
    const profile = await this.lookupProfileByFindName(name);

    // TODO: What are the supported link types?
    const twitterLink = profile?.links.find((link) => link.type === "twitter");
    const websiteLink = profile?.links.find((link) => link.type === "globe");

    return {
      address: profile?.address,
      domainName: profile?.findName,
      name: profile?.name,
      avatar: profile?.avatar,
      twitterUrl: twitterLink?.url,
      websiteUrl: websiteLink?.url,
      tags: profile?.tags,
      description: profile?.description,
    };
  }

  private async getProfileByFlownsName(name: string): Promise<FlowNameProfile | undefined> {
    const profile = await this.lookupProfileByFlownsName(name);

    return {
      address: profile?.owner!,
      domainName: profile?.name!,
      name: profile?.name,
      avatar: undefined,
      // TODO: Read from flowns text records
      twitterUrl: undefined,
      websiteUrl: undefined,
      tags: [],
      description: undefined,
    };
  }

  private async lookupProfileByFlownsName(name: string): Promise<FlownsDomainDetail> {
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
