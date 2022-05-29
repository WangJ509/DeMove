import smartpy as sp

class DeMove(sp.Contract):
    def __init__(self, admin):
        self.init(
            admin = admin,
            seller_info = sp.big_map(
                tkey = sp.TAddress,
                tvalue = sp.TString
            ),
            seller_products = sp.big_map(
                tkey = sp.TAddress,
                tvalue = sp.TMap(
                    k = sp.TString,
                    v = sp.TRecord(
                        price = sp.TMutez,
                        description = sp.TString
                    )
                )
            ),
            orders = sp.big_map(
                tkey = sp.TBytes,
                tvalue = sp.TRecord(
                    buyer = sp.TAddress,
                    seller = sp.TAddress,
                    product_name = sp.TString,
                    product_price = sp.TMutez,
                    delivery_fee = sp.TMutez,
                    buyer_collateral = sp.TMutez,
                    created_at = sp.TTimestamp,
                    seller_accepted = sp.TBool,
                    hash_s = sp.TBytes,
                    deliver = sp.TAddress,
                    deliver_collateral = sp.TMutez,
                    deliver_accepted = sp.TBool,
                    hash_s_verified = sp.TBool,
                    hash_b_verified = sp.TBool,
                    payment_settled = sp.TBool
                )
            )
        )

    @sp.entry_point
    def update_admin(self, admin):
        sp.verify(sp.sender == self.data.admin, "NOT_ADMIN")
        self.data.admin = admin
    
    @sp.entry_point
    def register_seller(self, info):
        sp.verify(~self.data.seller_info.contains(sp.sender),"You have registered!")
        self.data.seller_info[sp.sender] = info
        self.data.seller_products[sp.sender] = sp.map()

    @sp.entry_point
    def add_product(self, name, price, description):
        sp.verify(self.data.seller_products.contains(sp.sender),"You haven't registered!")
        sp.verify(price > 0,"price should be positive number")
        self.data.seller_products[sp.sender][name] = sp.record(
            price = sp.utils.nat_to_tez(price),
            description = description
        )

    # @sp.entry_point
    # def delete_product(self, name):
    #     sp.verify(self.data.seller_products.contains(sp.sender),"You haven't registered!")
    #     sp.verify(self.data.seller_products[sp.sender].contains(name),"The product doesn't exist")
    #     del self.data.seller_products[sp.sender][name]

    @sp.entry_point
    def create_order(self, seller_addr, product_name, delivery_fee, hash_b):
        sp.verify(self.data.seller_products.contains(seller_addr),"The seller_addr doesn't exist")
        sp.verify(self.data.seller_products[seller_addr].contains(product_name),"The product doesn't exist")
        sp.verify(~self.data.orders.contains(hash_b), "Duplicate hash_b, please do not use reuse key_b for another order")
        product = self.data.seller_products[seller_addr][product_name]
        collateral = sp.amount - product.price - sp.utils.nat_to_tez(delivery_fee)
        sp.verify(collateral >= product.price,"Collateral should be at least the product price")
        self.data.orders[hash_b] = sp.record(
            buyer = sp.sender,
            seller = seller_addr,
            product_name = product_name,
            product_price = product.price,
            delivery_fee = sp.utils.nat_to_tez(delivery_fee),
            buyer_collateral = collateral,
            created_at = sp.now,
            seller_accepted = False,
            hash_s = sp.bytes("0x"),
            deliver = sp.sender,
            deliver_collateral = sp.mutez(0),
            deliver_accepted = False,
            hash_s_verified = False,
            hash_b_verified = False,
            payment_settled = False
        )

    @sp.entry_point
    def accept_order(self, hash_b, hash_s):
        sp.verify(self.data.orders.contains(hash_b), "Order not found")
        order = self.data.orders[hash_b]
        order.seller_accepted = True
        order.hash_s = hash_s

    @sp.entry_point
    def accept_delivery(self, hash_b):
        sp.verify(self.data.orders.contains(hash_b), "Order not found")
        order = self.data.orders[hash_b]
        sp.verify(~order.deliver_accepted, "The order has been accept for delivery")
        collateral = sp.amount
        sp.verify(collateral >= order.product_price,"Collateral should be at least the product price")
        order.deliver_collateral = collateral
        order.deliver = sp.sender
        order.deliver_accepted = True

    @sp.entry_point
    def finish_order_buyer(self, hash_b, key_s):
        sp.verify(self.data.orders.contains(hash_b), "Order not found")
        order = self.data.orders[hash_b]
        sp.verify(order.deliver_accepted, "No deliver has accepted this order")
        sp.verify(self.verify_sha256(key_s, order.hash_s), "Wrong key_s")
        order.hash_s_verified = True
        self.settle_payment_if_finished(order)

    @sp.entry_point
    def finish_order_deliver(self, hash_b, key_b):
        sp.verify(self.data.orders.contains(hash_b), "Order not found")
        order = self.data.orders[hash_b]
        sp.verify(order.deliver_accepted, "No deliver has accepted this order")
        sp.verify(self.verify_sha256(key_b, hash_b), "Wrong key_b")
        order.hash_b_verified = True
        self.settle_payment_if_finished(order)

    def verify_sha256(self, key, value):
        return value == sp.sha256(key)

    def settle_payment_if_finished(self, order):
        sp.if order.hash_s_verified & order.hash_b_verified:
            sp.send(order.seller, order.product_price)
            sp.send(order.deliver, order.delivery_fee + order.deliver_collateral)
            sp.send(order.buyer, order.buyer_collateral)
            order.payment_settled = True

@sp.add_test(name = "DeMove Unit Test")
def test():
    scenario = sp.test_scenario()
    scenario.h1("DeMove is a Decentralized Delivery Service!!!")

    admin = sp.address("tz1Spw8WhhiQuuSMTnxskgtaituy2zrcRNXg")
    seller1 = sp.address("tz1-seller1-address")

    c = DeMove(admin)
    scenario += c

    scenario.h2("Test register seller")
    c.register_seller("I am a banana seller").run(sender=seller1)
    c.register_seller("I register twice!!!").run(sender=seller1, valid=False)

    scenario.h2("Test add product")
    c.add_product(
        name="banana1",
        price=87,
        description="This is a tasty banana"
    ).run(sender=seller1)

    scenario.h2("Test create order")
    buyer1 = sp.address("tz1-buyer1-address")
    key_b = sp.pack("I am key b")
    hash_b = sp.sha256(key_b)
    c.create_order(
        seller_addr = seller1,
        product_name = "banana1",
        delivery_fee = 50,
        hash_b = hash_b,
    ).run(sender=buyer1, amount=sp.tez(600), valid=True)

    scenario.h2("Test seller accept order")
    key_s = sp.pack("I am key s")
    hash_s = sp.sha256(key_s)
    c.accept_order(
        hash_b = hash_b,
        hash_s = hash_s
    ).run(sender=seller1, valid=True)

    scenario.h2("Test deliver accept order")
    deliver1 = sp.address("tz1-deliver1-address")
    c.accept_delivery(hash_b).run(sender=deliver1, amount=sp.tez(87))

    # Now, assume deliver and buyer have exchange their key_b and key_s
    scenario.h2("Test finishing the order")
    c.finish_order_buyer(
        hash_b = hash_b,
        key_s = key_s
    ).run(sender=buyer1)
    c.finish_order_deliver(
        hash_b = hash_b,
        key_b = key_b
    ).run(sender=deliver1)

    # scenario.h2("Test delete product")
    # c.delete_product(
    #     name="banana2",
    # ).run(sender=seller1)