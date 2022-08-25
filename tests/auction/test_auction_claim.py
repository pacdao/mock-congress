import brownie


def test_claimable_amount_updates_after_auction_ends(auction_ended, seat, alice, bob):
    alice_bid = auction_ended.auction_bids(seat, alice)
    assert alice_bid > 0
    assert auction_ended.redeemable_balance(alice) == alice_bid


def test_winner_claimable_amount_stays_zero(auction_ended, seat, alice, bob):
    bob_bid = auction_ended.auction_bids(seat, bob)
    assert bob_bid > 0
    assert auction_ended.redeemable_balance(bob) == 0


def test_loser_can_claim_funds_after_auction(auction_ended, seat, alice, bob):
    alice_init = alice.balance()
    auction_ended.redeem_missing(alice, {"from": alice})
    alice_bid = auction_ended.auction_bids(seat, alice)
    assert alice.balance() == alice_init + alice_bid


def test_winner_cannot_claim_funds_after_auction(auction_ended, seat, alice, bob):
    bob_init = bob.balance()
    with brownie.reverts():  # "No claim"):
        auction_ended.redeem_missing(bob, {"from": bob})
    bob_bid = auction_ended.auction_bids(seat, bob)
    assert bob_bid > 0
    assert bob.balance() == bob_init


def test_loser_cannot_claim_funds_twice(auction_ended, seat, alice, bob):
    alice_init = alice.balance()
    auction_ended.redeem_missing(alice, {"from": alice})
    alice_bid = auction_ended.auction_bids(seat, alice)
    assert alice.balance() == alice_init + alice_bid
