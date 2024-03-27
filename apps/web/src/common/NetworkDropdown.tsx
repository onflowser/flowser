import { Menu } from "@onflowser/ui/src/common/overlays/Menu/Menu";
import { MenuItem } from "@szhsin/react-menu";
import { FlowNetworkId, FlowUtils } from "@onflowser/core/src/flow-utils";
import { FlowserIcon } from "@onflowser/ui/src/common/icons/FlowserIcon";

type NetworkDropdownProps = {
  value: FlowNetworkId;
  onChange: (network: FlowNetworkId) => void;
}

export function NetworkDropdown(props: NetworkDropdownProps) {
  const { value, onChange } = props;

  const supportedNetworks = FlowUtils.getValidFlowNetworks();

  return (
    <Menu
      position="anchor"
      menuButton={
        <button className="border flex gap-x-[10px] border-gray-500 text-gray-300 items-center p-2 rounded-sm">
          <span className="capitalize">{value}</span>
          <FlowserIcon.ArrowDown />
        </button>
      }
    >
      {supportedNetworks.map(network => (
        <MenuItem
          key={network}
          onClick={() => {
            if (network !== value) {
              onChange(network)
            }
          }}
          className="capitalize"
        >
          {network}
        </MenuItem>
      ))}
    </Menu>
  )
}
