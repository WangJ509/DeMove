import React from "react";
import { TezosToolkit, WalletContract } from "@taquito/taquito";
import ContractButton from "./ContractButton";

type RestaurantBrowserProps = {
  storage: any;
  seller?: string;
  buyButton?: boolean;
  contract: WalletContract | any;
  Tezos: TezosToolkit;
};

const RestaurantBrowser = ({
  storage,
  seller,
  buyButton,
  contract,
  Tezos,
}: RestaurantBrowserProps): JSX.Element => {

  const getArgsFactory = (dishName : string, sellerAddr : string) => {
    const args = [undefined, undefined, dishName, sellerAddr];
    return async () => {
      const deliveryFee = prompt("Decide the delivery fee"); 
      if (deliveryFee)
        args[0] = deliveryFee;
      const key = prompt("Enter your key");
      if (key) {
        const encoder = new TextEncoder();
        const hash = await crypto.subtle.digest('SHA-256', encoder.encode(key)); 
        const hashArray = Array.from(new Uint8Array(hash));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        args[1] = hashHex;
      }
      return args;
    };
  };

  const generateRestaurantList = (data: any) => {
    if (!data) {
      return <p>Sorry, the data are not ready yet!</p>;
    }
    let RestaurantMap = new Map();
    data.seller_info.forEach((x : any) => RestaurantMap.set(x.data.key.value, {restaurantName: x.data.value.value}));
    data.seller_products.forEach((x : any) => x.data.value.children && RestaurantMap.set(x.data.key.value, {...RestaurantMap.get(x.data.key.value), dishList: x.data.value.children.map((y : any) => ({name: y.name, description: y.children[0].value, price: y.children[1].value}))}));
    if (seller) {
      const sellerValue = RestaurantMap.get(seller);
      RestaurantMap = new Map();
      RestaurantMap.set(seller, sellerValue);
    }
    return Array.from(RestaurantMap).map(([key, value]) => (
      <div key={key}>
        <h3 className="text-align-center"><i className="fas fa-store"></i>&nbsp; {value.restaurantName}</h3>
        <div>
          {!value.dishList ? <div><h4>No items currently.</h4></div> : value.dishList.map((dish : any, index : number) => (
            <div key={"dish_" + index} style={{display: 'flex', justifyContent: 'space-between'}}>
              <div style={{textAlign: 'left'}}>
                <p><i className="fas fa-utensils"></i>&nbsp; <b>{dish.name}</b> - {dish.price / 1000000} ꜩ</p>
                <p>{dish.description}</p>
              </div>
              <div style={{textAlign: 'right', alignSelf: 'center'}}>
                {!buyButton ? null : (
                  <ContractButton contract={contract} Tezos={Tezos} contractMethod="create_order" getArgs={getArgsFactory(dish.name, key)} getAmount={(args : any) => Number(args[0]) + 2 * dish.price / 1000000}>
                    Order
                  </ContractButton>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    ));
  };

  return (
    <div>
      {generateRestaurantList(storage)}
    </div>
  );
};

export default RestaurantBrowser;
