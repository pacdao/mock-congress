import pytest
from brownie import accounts, exceptions

#
# These tests are meant to be executed with brownie. To run them:
# * create a brownie project using brownie init
# * in the contract directory, place Counter.sol (maybe using a symlink)
# * in the tests directory, place this script
# * run brownie test
#

#
# Inquire initial count
#
def test_initialCount(moc):
    count = moc.totalSupply()
    assert 0 == count


#
# Test increment
#
def test_increment(minted):
    assert minted.totalSupply() == 1


def test_token_by_index_accurate(moc, minter, alice):
    assert moc.totalSupply() == 0
    quantity = 10
    price = minter.mint_batch_price(quantity, alice)
    tx = minter.mint_batch(quantity, {"from": alice, "value": price})
    my_tokens = []
    for i in range(quantity):
        my_tokens.append(moc.tokenByIndex(i))

    for i in range(len(tx.events)):
        if "seat_id" in tx.events[i]:
            assert tx.events[i]["seat_id"] in my_tokens
