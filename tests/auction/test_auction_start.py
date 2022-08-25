import brownie
import pytest
from brownie import ZERO_ADDRESS, Wei, accounts, exceptions, web3


def test_auction_not_started(minter, seat):
    assert minter.auction_deadline(seat) == 0


def test_auction_not_started_view(minter, seat):
    assert not minter.is_auction_ended(seat)


def test_auction_not_started_view_open(minter, seat):
    assert minter.is_seat_open_for_auction(seat)


@pytest.mark.skip_coverage
def test_auction_not_started_no_deadline(minter, seat):
    assert minter.auction_deadlines()[seat] == 0


def test_can_start_auction(auction, seat):
    assert auction.auction_deadline(seat) > 0


def test_auction_bid_open_min_price_accurate(auction, seat, alice):
    assert auction.auction_bids(seat, alice) == auction.auction_interval()


def test_auction_bid_open_min_price_set(auction, seat, alice):
    assert auction.auction_bids(seat, alice) == auction.auction_interval()


def test_auction_bid_open_leader_set(auction, seat, alice):
    assert auction.auction_leaders(seat) == alice


def test_killed_cannot_bid(auction, seat, alice):
    auction.admin_set_contract_status(False, {"from": auction.owner()})
    with brownie.reverts():  # "dev: Auction has ended"
        auction.auction_bid(seat, {"from": alice, "value": auction.auction_interval()})


def test_cannot_start_auction_on_restricted_list(auction, alice, restricted_list):
    for i in restricted_list:
        with brownie.reverts():  # "dev: No Auction for this Seat"
            auction.auction_bid(i, {"from": alice, "value": auction.auction_interval()})


@pytest.mark.skip_coverage
def test_admin_can_add_to_restricted_list(auction, alice, seat):
    auction.admin_add_to_no_mint_list(seat, {"from": auction.owner()})
    with brownie.reverts():  # "dev: No Auction for this Seat"
        auction.auction_bid(seat, {"from": alice, "value": auction.auction_interval()})


@pytest.mark.skip_coverage
def test_admin_can_remove_from_restricted_list(auction, alice, restricted_list):
    seat = restricted_list[0]
    auction.admin_remove_from_no_mint_list(seat, {"from": auction.owner()})
    auction.auction_bid(seat, {"from": alice, "value": auction.auction_interval()})
    assert auction.user_bids(alice)[seat] > 0


def test_cannot_start_auction_on_hardcoded_list(auction, alice):
    for i in [367, 369, 392, 333]:
        with brownie.reverts():  # "dev: No Auction for this Seat"
            auction.auction_bid(i, {"from": alice, "value": auction.auction_interval()})
