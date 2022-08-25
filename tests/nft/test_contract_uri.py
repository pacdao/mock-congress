import brownie


def test_contract_uri_exists(token):
    assert len(token.contractURI()) > 10
