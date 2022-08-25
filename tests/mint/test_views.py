import pytest
from brownie import *


@pytest.mark.skip_coverage
def test_deadline_correct(auction, seat):
    assert auction.auction_deadlines()[seat] > 0


@pytest.mark.skip_coverage
def test_winners_correct(auction, seat):
    assert auction.auction_max_bids()[seat] == auction.auction_interval()


@pytest.mark.skip_coverage
def test_bids_correct(auction, seat, alice):
    assert auction.seat_winners()[seat] == alice


@pytest.mark.skip_coverage
def test_statuses_correct(auction, seat):
    assert auction.auction_statuses()[seat] == 1


@pytest.mark.skip_coverage
def test_seats_correct(auction, seat):
    assert auction.seats(seat) == auction


@pytest.mark.skip_coverage
def test_default_deadline_correct(auction, seat):
    assert auction.auction_deadlines()[seat + 1] == 0


@pytest.mark.skip_coverage
def test_default_winners_correct(auction, seat, alice):
    assert auction.auction_max_bids()[seat + 1] == 0


@pytest.mark.skip_coverage
def test_default_bids_correct(auction, seat):
    assert auction.seat_winners()[seat + 1] == ZERO_ADDRESS


@pytest.mark.skip_coverage
def test_default_statuses_correct(auction, seat):
    assert auction.auction_statuses()[seat + 1] == 0


@pytest.mark.skip_coverage
def test_mint_batch_statuses(minter):
    tx = minter.mint_batch(
        1, {"from": accounts[0], "value": minter.mint_batch_price(1, accounts[0])}
    )
    token_id = tx.events["SeatReserved"]["seat_id"]
    assert token_id > 0
    assert minter.auction_statuses()[token_id] == 2


@pytest.mark.skip_coverage
def test_mint_batch_deadlines(minter):
    tx = minter.mint_batch(
        1, {"from": accounts[0], "value": minter.mint_batch_price(1, accounts[0])}
    )
    token_id = tx.events["SeatReserved"]["seat_id"]
    assert token_id > 0
    assert minter.auction_deadlines()[token_id] > 0


@pytest.mark.skip_coverage
def test_mint_batch_max_bids(minter):
    tx = minter.mint_batch(
        1, {"from": accounts[0], "value": minter.mint_batch_price(1, accounts[0])}
    )
    token_id = tx.events["SeatReserved"]["seat_id"]
    assert token_id > 0
    assert minter.auction_max_bids()[token_id] == minter.mint_batch_price(1, accounts[0])


@pytest.mark.skip_coverage
def test_mint_batch_seat_winners(minter):
    tx = minter.mint_batch(
        1, {"from": accounts[0], "value": minter.mint_batch_price(1, accounts[0])}
    )
    token_id = tx.events["SeatReserved"]["seat_id"]
    assert token_id > 0
    assert minter.seat_winners()[token_id] == a[0]
