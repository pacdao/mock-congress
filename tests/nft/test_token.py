import brownie
import pytest
from brownie import ZERO_ADDRESS, accounts, exceptions

#
# These tests are meant to be executed with brownie. To run them:
# brownie test
#

# Test the name method
def test_name(token, token_metadata):
    assert token.name() == token_metadata["name"]


# Test the symbol
def test_symbol(token, token_metadata):
    assert token.symbol() == token_metadata["symbol"]


# Test balanceOf - initially, the entire supply should be
def test_balanceOf(minted, alice, moc, seat):
    assert moc.ownerOf(seat) == alice
    assert moc.balanceOf(alice.address) == moc.totalSupply()


# Test a valid transfer
def test_transfer(minted, alice, bob, moc, seat):
    token = moc
    init_bal_alice = token.balanceOf(alice)
    init_bal_bob = token.balanceOf(bob)

    txn_receipt = token.transferFrom(alice, bob, seat, {"from": alice})
    assert init_bal_alice - 1 == token.balanceOf(alice)
    assert init_bal_bob + 1 == token.balanceOf(bob)

    # Verify that event has been emitted
    event = txn_receipt.events["Transfer"]
    assert event["_from"] == alice
    assert event["_to"] == bob
    assert event["_tokenId"] == seat


# Test an unauthorized transferFrom
def test_transfer_nonowner(minted, alice, bob, moc):
    token = moc
    old_balance_alice = token.balanceOf(alice)
    old_balance_bob = token.balanceOf(bob)

    with brownie.reverts():  # "ERC721: transfer caller is not owner nor approved"):
        token.transferFrom(alice, bob, 1, {"from": bob})
    assert token.balanceOf(alice) == old_balance_alice
    assert token.balanceOf(bob) == old_balance_bob


# Test a transfer with no balance
def test_transfer_nobalance(token, alice, bob):

    old_balance_alice = token.balanceOf(alice)
    old_balance_bob = token.balanceOf(bob)

    with brownie.reverts():
        token.transferFrom(alice, bob, 1, {"from": bob})


# Test approval
def test_approve(minted, alice, bob, moc, seat):
    # Allow bob to spend 100 token on my behalf
    txn_receipt = moc.approve(bob, seat, {"from": alice})

    # Verify that event has been emitted
    event = txn_receipt.events["Approval"]
    assert event["_owner"] == alice
    assert event["_approved"] == bob
    assert event["_tokenId"] == seat

    # Check
    assert moc.getApproved(seat) == bob


# Test approval - overwrite old value
def test_approve_overwrite(minted, alice, bob, charlie, moc, seat):

    # Allow bob to spend 100 moc on my behalf
    moc.approve(bob, seat, {"from": alice})

    # Check
    assert moc.getApproved(seat) == bob

    # Overwrite
    moc.approve(charlie, seat, {"from": alice})
    assert moc.getApproved(seat) == charlie


def test_cannot_approve_owner(minted, alice, bob, moc, seat):

    # Allow bob to spend 100 moc on my behalf
    moc.approve(bob, seat, {"from": alice})

    # Check
    assert moc.getApproved(seat) == bob

    # Overwrite
    with brownie.reverts():  # "ERC721: approval to current owner"):
        moc.approve(alice, seat, {"from": alice})


# Test a valid withdrawal
def test_transferFrom(minted, alice, bob, moc, seat):
    init_balance_alice = moc.balanceOf(alice)
    init_balance_bob = moc.balanceOf(bob)

    # Authorize bob
    moc.approve(bob, seat, {"from": alice})
    txn_receipt = moc.transferFrom(alice, bob, seat, {"from": bob})
    assert init_balance_alice - 1 == moc.balanceOf(alice)
    assert init_balance_bob + 1 == moc.balanceOf(bob)

    # Verify that event has been emitted
    event = txn_receipt.events["Transfer"]
    assert event["_from"] == alice
    assert event["_to"] == bob
    assert event["_tokenId"] == seat

    # Verify that the approval has been set to ZERO_ADDRESS
    assert moc.getApproved(seat) == ZERO_ADDRESS
