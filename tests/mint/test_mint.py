import brownie
import pytest
from brownie import *
from brownie.test import given, strategy


def test_reserve_batch(minter, token):
    num = 5
    minter.mint_batch(5, {"from": accounts[0], "value": minter.mint_batch_price(5, accounts[0])})
    assert token.tokenOfOwnerByIndex(accounts[0], 4) > 0


def test_reserve_increases_nft_total_supply(minter, token):
    init_claimed = token.totalSupply()
    minter.mint_batch(1, {"from": accounts[0], "value": minter.mint_batch_price(1, accounts[0])})
    assert token.totalSupply() - init_claimed == 1


def test_reserve_too_many(minter):
    with brownie.reverts():
        minter.mint_batch(
            minter.seat_count() + 1,
            {
                "from": accounts[0],
                "value": minter.mint_batch_price(minter.seat_count() + 1, accounts[0]),
            },
        )


def test_batch_current_leader_updates(minter):
    tx = minter.mint_batch(
        1, {"from": accounts[0], "value": minter.mint_batch_price(1, accounts[0])}
    )
    seat_minted = tx.events["SeatReserved"]["seat_id"]
    assert minter.current_leader(seat_minted) == accounts[0]


def test_batch_auction_unavailable(minter):
    tx = minter.mint_batch(
        1, {"from": accounts[0], "value": minter.mint_batch_price(1, accounts[0])}
    )
    seat_minted = tx.events["SeatReserved"]["seat_id"]
    assert not minter.is_seat_open_for_auction(seat_minted)


def test_reserve_after_another(minter, alice, bob, token):
    minter.mint_batch(1, {"from": alice, "value": minter.mint_batch_price(1, alice)})
    minter.mint_batch(1, {"from": bob, "value": minter.mint_batch_price(1, alice)})

    assert token.balanceOf(alice) == 1
    assert token.balanceOf(bob) == 1


def test_minting_generates_nft(minter, moc, alice):
    init_bal = moc.balanceOf(alice)
    tx = minter.mint_batch(1, {"from": alice, "value": minter.mint_batch_price(1, alice)})
    seat_minted = tx.events["SeatReserved"]["seat_id"]

    assert moc.balanceOf(alice) == 1


def test_seats_by_index_updates_on_multi_mint(minter, alice, token):
    minter.mint_batch(1, {"from": alice, "value": minter.mint_batch_price(1, alice)})
    minter.mint_batch(1, {"from": alice, "value": minter.mint_batch_price(1, alice)})
    assert token.balanceOf(alice) == 2


def test_user_balance_updates_on_multi_mint(minter, bob, token):
    assert token.balanceOf(bob) == 0
    minter.mint_batch(1, {"from": bob, "value": minter.mint_batch_price(1, bob)})
    assert token.balanceOf(bob) == 1
    minter.mint_batch(1, {"from": bob, "value": minter.mint_batch_price(1, bob)})
    assert token.balanceOf(bob) == 2


def test_reserve_quantity_correct(minter, bob, token):
    assert token.balanceOf(bob) == 0
    minter.mint_batch(5, {"from": bob, "value": minter.mint_batch_price(5, bob)})

    assert token.balanceOf(bob) == 5


def test_cannot_mint_more_than_max_mint(minter, alice):
    max_qty = minter.max_mint_batch_quantity()

    with brownie.reverts():  # "dev: Mint batch capped"
        price = minter.mint_batch_price(max_qty + 1, alice)
        minter.mint_batch(max_qty + 1, {"from": alice, "value": price})


def test_can_mint_max_mint(minter, alice, token):
    max_qty = minter.max_mint_batch_quantity()

    price = minter.mint_batch_price(max_qty, alice)
    minter.mint_batch(max_qty, {"from": alice, "value": price})
    assert token.balanceOf(alice) == max_qty
