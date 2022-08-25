import brownie
import pytest
from brownie import *
from brownie.test import given, strategy


@pytest.mark.skip_coverage
@pytest.skip(allow_module_level=True)
def test_can_mint_every_seat(minter, alice):
    loops = minter.seat_count() // 10
    remainder = minter.seat_count() % 10

    for i in range(loops):
        price = minter.mint_batch_price(10)
        minter.mint_batch(10, {"from": alice, "value": price})


@given(
    offset=strategy("uint256", max_value=10000),
)
def test_mint_batch_does_not_mint_restricted(minter, offset, token, restricted_list):
    chain.mine(timedelta=offset)

    minter.mint_batch(10, {"from": accounts[0], "value": minter.mint_batch_price(10)})
    with brownie.reverts():
        token.ownerOf(restricted_list[0])


@given(
    offset=strategy("uint256", max_value=10000),
)
def test_mint_batch_does_not_mint_out_of_bounds(minter, offset, token, restricted_list):
    chain.mine(timedelta=offset)
    minter.mint_batch(10, {"from": accounts[0], "value": minter.mint_batch_price(10)})
    with brownie.reverts():
        token.ownerOf(restricted_list[0])

    with brownie.reverts():
        token.ownerOf(minter.seat_count() + 1)
