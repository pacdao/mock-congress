import brownie
import pytest
from brownie import ZERO_ADDRESS, StoneCutter, Wei, accounts, chain, exceptions, web3


def test_auction_initially_no_claimed(minter):
    assert minter.claimed_seats() == 0


def test_seats_filled_initially_empty(minter):
    with brownie.reverts():
        minter.seats_filled(0)


def test_can_bid_after_auction_begins(auction, bob, seat):
    assert auction.auction_bids(seat, bob) == 0
    _bid_val = Wei("1 ether")
    auction.auction_bid(seat, {"from": bob, "value": _bid_val})
    assert auction.auction_bids(seat, bob) == _bid_val


def test_leader_changes_after_initial_bid(auction, bob, seat):
    auction.auction_bid(seat, {"from": bob, "value": Wei("1 ether")})
    assert auction.auction_leaders(seat) == bob


def test_current_leader_changes_after_initial_bid(auction, bob, seat):
    auction.auction_bid(seat, {"from": bob, "value": Wei("1 ether")})
    assert auction.current_leader(seat) == bob


def test_leader_does_not_update_on_underbid(auction, bob, charlie, seat):
    auction.auction_bid(seat, {"from": bob, "value": Wei("1 ether")})
    auction.auction_bid(seat, {"from": charlie, "value": Wei(".9 ether")})

    assert auction.auction_leaders(seat) == bob


@pytest.mark.skip_coverage
def test_leader_updates_on_overbid(auction, bob, charlie, seat):
    auction.auction_bid(seat, {"from": bob, "value": Wei("1 ether")})
    auction.auction_bid(seat, {"from": charlie, "value": Wei("1.1 ether")})

    assert auction.auction_leaders(seat) == charlie


def test_auction_deadline_updates_on_bid(auction, bob, charlie, seat):
    start = auction.auction_deadline(seat)
    chain.mine(timedelta=5)
    auction.auction_bid(seat, {"from": bob, "value": auction.auction_interval()})
    final = auction.auction_deadline(seat)
    assert start != final


@pytest.mark.skip_coverage
def test_auction_status_updates_on_bid(auction, seat):
    assert auction.auction_status(seat) == 1


def test_seats_filled_populates(minter, seat):
    assert minter.seats_filled(0) == seat


def test_cannot_bid_after_deadline(auction, bob, seat):
    deadline = auction.auction_deadline(seat)
    chain.mine(timestamp=deadline + 1)
    with brownie.reverts("Auction ended"):
        auction.auction_bid(seat, {"from": bob, "value": auction.auction_interval()})


@pytest.mark.skip_coverage
def test_user_bids_accurate(auction, seat, alice):
    assert auction.auction_bids(seat, alice) > 0
    assert auction.user_bids(alice)[seat] > 0
    assert auction.user_bids(alice)[0] == 0
