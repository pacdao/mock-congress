from brownie import *


def main():
    if network.show_active() in ["mainnet-fork", "mainnet-fork-alchemy", "development"]:
        deployer = accounts[0]
        verify_source = False
    elif network.show_active() == "mainnet":
        deployer = accounts.load("minnow")
        verify_source = False
    else:
        deployer = accounts.load("husky")
        verify_source = False

    nft = MockCongress.deploy({"from": deployer}, publish_source=verify_source)
    minter = StoneCutter.deploy({"from": deployer}, publish_source=verify_source)
    minter.admin_set_nft_addr(nft, {"from": deployer})
    nft.set_minter(minter, {"from": deployer})
