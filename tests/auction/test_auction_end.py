import json
import os

import brownie
import pytest
from brownie import ZERO_ADDRESS, Wei, accounts, chain, exceptions, web3


def test_cannot_end_auction_before_start(minter, seat, alice):
    with brownie.reverts():  # "Seat not assigned"):
        minter.generate_mint(
            seat,
            {"from": alice},
        )


def test_can_end_auction(auction, seat, token, alice):
    assert auction.auction_deadline(seat) > 0
    assert token.balanceOf(alice) == 0
    chain.mine(timedelta=auction.auction_duration() + 1)

    auction.generate_mint(seat, {"from": alice})
    assert token.balanceOf(alice) > 0


def test_live_auction_is_biddable(auction, seat):
    x = auction.is_seat_open_for_auction(seat)
    assert x == True


def test_can_check_auction_end(auction, seat, token, alice):
    assert auction.auction_deadline(seat) > 0
    assert token.balanceOf(alice) == 0
    chain.mine(timedelta=auction.auction_duration() + 1)

    assert auction.is_auction_ended(seat)


def test_can_check_auction_not_ended(auction, seat, token, alice):
    assert auction.auction_deadline(seat) > 0
    assert token.balanceOf(alice) == 0
    chain.mine(timedelta=auction.auction_duration() - 10)

    assert auction.is_auction_ended(seat) == False


@pytest.mark.skip_coverage
def test_mint_status_updates(
    auction,
    seat,
    token,
    alice,
):
    assert auction.auction_deadline(seat) > 0
    assert token.balanceOf(alice) == 0
    assert auction.mint_statuses()[seat] == False
    chain.mine(timedelta=auction.auction_duration() + 1)

    auction.generate_mint(seat, {"from": alice})
    assert auction.mint_statuses()[seat] == True


@pytest.mark.skip_coverage
def test_token_uri_correct(auction, seat, token, alice):
    assert auction.auction_deadline(seat) > 0
    assert token.balanceOf(alice) == 0
    assert auction.mint_statuses()[seat] == False
    chain.mine(timedelta=auction.auction_duration() + 1)
    auction.generate_mint(seat, {"from": alice})
    assert token.tokenURI(seat) == f"{token.base_uri()}{seat}"


@pytest.mark.skip_coverage
def test_cannot_remint(auction, seat, token, alice):
    assert auction.auction_deadline(seat) > 0
    assert token.balanceOf(alice) == 0
    assert auction.mint_statuses()[seat] == False
    chain.mine(timedelta=auction.auction_duration() + 1)

    auction.generate_mint(seat, {"from": alice})
    with brownie.reverts():  # "Seat already minted"):
        auction.generate_mint(seat, {"from": alice})


def test_cannot_end_auction_prematurely(auction, seat, token, alice):
    assert auction.auction_deadline(seat) > 0
    assert token.balanceOf(alice) == 0
    chain.mine(timestamp=auction.auction_deadline(seat) - 1)

    with brownie.reverts():
        auction.generate_mint(seat, {"from": alice})
