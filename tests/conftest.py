#!/usr/bin/python3
import pytest
from brownie import *


@pytest.fixture(scope="function", autouse=True)
def isolate(fn_isolation):
    # perform a chain rewind after completing each test, to ensure proper isolation
    # https://eth-brownie.readthedocs.io/en/v1.10.3/tests-pytest-intro.html#isolation-fixtures
    pass


@pytest.fixture(scope="session")
def alice(accounts):
    yield accounts[0]


@pytest.fixture(scope="session")
def bob(accounts):
    yield accounts[1]


@pytest.fixture(scope="session")
def charlie(accounts):
    yield accounts[2]


@pytest.fixture(scope="module")
def token(alice):
    # return MoC.deploy(alice, {"from": alice})
    return MockCongress.deploy({"from": alice})


@pytest.fixture(scope="function")
def minted(alice, token, seat):
    token.mint(alice, seat, {"from": alice})
    return token


@pytest.fixture(scope="module")
def moc(alice, token):
    return token


@pytest.fixture(scope="module")
def minter(alice, token):
    mint_contract = StoneCutter.deploy({"from": alice})
    mint_contract.admin_set_nft_addr(token)
    token.set_minter(mint_contract, {"from": alice})
    return mint_contract


@pytest.fixture(scope="module")
def seat():
    seat = 100
    return seat


@pytest.fixture(scope="module")
def auction(seat, minter, bob, alice):
    minter.auction_bid(
        seat,
        {"from": alice, "value": minter.auction_interval()},
    )

    return minter


@pytest.fixture(scope="module")
def auction_ended(seat, minter, bob, alice):
    minter.auction_bid(
        seat,
        {"from": alice, "value": minter.min_price()},
    )
    minter.auction_bid(seat, {"from": bob, "value": minter.min_price() * 2})
    chain.mine(timestamp=minter.auction_deadline(seat) + 1)
    return minter


@pytest.fixture(scope="session")
def tokenReceiver(accounts):
    return ERC721TokenReceiverImplementation.deploy({"from": accounts[0]})


@pytest.fixture(scope="module")
def token_metadata():
    return {"name": "PAC DAO PhatCats", "symbol": "PHATCAT", "seat_count": 538}


# Some representatives sadly passed away and are ineligible for mint
@pytest.fixture(scope="module")
def restricted_list():
    return [367, 369, 392, 333]
