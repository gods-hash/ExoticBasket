import React, {useCallback, useMemo, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {FlatList} from 'react-native-gesture-handler';
import {useSelector, useDispatch} from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ApplyCoupanMethod,
  Cartget,
  GetAllCoupanMethod,
  GetDelivryChargesMethod,
  removecart,
  updatecartAction,
} from '../redux/actions/UserAction';
import Headers from '../Components/Headers';
import {scale} from '../styles/responsiveSize';
import Address from './Address';
import {useFocusEffect} from '@react-navigation/native';
import NoDataFound from '../Components/NoDataFound';
import {BASE_URL} from '../apiEndpoints/Base_Url';
import Paymentscreen from './Paymentscreen';
import ListModal from '../Components/ListModal';
import {showToast} from '../styles/utils/toast';
import store from '../redux/Store';

const Cart = ({navigation}) => {
  const data = useSelector(state => state?.product.cart);
  const selectedAddress = useSelector(state => state?.product?.selectedAddres);
  const dispatch = useDispatch();
  const product = useSelector(state => state?.auth?.data?.customer_data);
  const cartArray = useSelector(state => state?.product.cart?.data?.products);
  const cartCoupon = useSelector(state => state?.product.cart?.data);
  const {deliveryCharges} = useSelector(state => state?.product);
  const [couponLoder, setCoupanLoder] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const allCoupan = useSelector(state => state?.product?.allCoupan);
  const accessToken = useSelector(state => state?.auth?.data?.jwt_response);

  useFocusEffect(
    useCallback(() => {
      getCartData();
    }, []),
  );

  const getCartData = async () => {
    await dispatch(Cartget(product?.saasId, product?.storeId, product?.id));
    await dispatch(GetAllCoupanMethod());
    await dispatch(GetDelivryChargesMethod());
  };

  const onDelete = async item => {
    const res = await dispatch(
      removecart(product?.saasId, product?.storeId, product?.id, item?.id),
    );
    if (res?.status) getCartData();
  };

  const applyCoupon = async code => {
    setCoupanLoder(true);
    await dispatch(ApplyCoupanMethod(code));
    setCoupanLoder(false);
  };

  const handleSelectItem = async item => {
    await applyCoupon(item?.couponCode);
    setModalVisible(false);
  };

  const total = data?.total_gram_invoice_amount + deliveryCharges;

  const capitalizeFirstLetter = str =>
    str?.charAt(0).toUpperCase() + str?.slice(1);

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#f5f5f5'}}>

      <Headers title="My Cart" quantity={cartArray?.length} />

      {data?.data?.products?.length > 0 ? (
        <>
          <FlatList
            data={cartArray || []}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{paddingBottom: 300}}

            ListFooterComponent={
              <>
                {/* COUPON */}
                {accessToken !== 'GUEST' && (
                  <TouchableOpacity
                    style={styles.couponBox}
                    onPress={() => setModalVisible(true)}>
                    <MaterialCommunityIcons
                      name="ticket-percent"
                      size={22}
                      color="#ff6b00"
                    />
                    <Text style={styles.couponText}>
                      {data?.data?.coupanApllied
                        ? 'Coupon Applied'
                        : 'Redeem Coupon'}
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            }

            renderItem={({item}) => (
              <View style={styles.card}>
                <Image
                  source={{
                    uri: `${BASE_URL}item/get-image/${item.item_id}`,
                  }}
                  style={styles.image}
                />

                <View style={{flex: 1, marginLeft: 10}}>
                  <Text style={styles.title}>
                    {capitalizeFirstLetter(item?.itemName)}
                  </Text>

                  <Text style={styles.desc}>
                    Fresh & delicious item
                  </Text>

                  <Text style={styles.price}>₹{item?.new_price}</Text>
                </View>

                {/* QTY */}
                <View style={styles.qtyBox}>
                  <TouchableOpacity
                    onPress={() => {
                      if (item?.productQty <= 1) {
                        onDelete(item);
                      } else {
                        dispatch(
                          updatecartAction(
                            item?.productQty - 1,
                            product?.saasId,
                            product?.storeId,
                            product?.id,
                            item?.id,
                          ),
                        );
                      }
                    }}>
                    <Text style={styles.minus}>−</Text>
                  </TouchableOpacity>

                  <Text style={styles.qty}>{item?.productQty}</Text>

                  <TouchableOpacity
                    onPress={() =>
                      dispatch(
                        updatecartAction(
                          item?.productQty + 1,
                          product?.saasId,
                          product?.storeId,
                          product?.id,
                          item?.id,
                        ),
                      )
                    }>
                    <Text style={styles.plus}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />

          {/* BOTTOM */}
          <View style={styles.bottom}>

            {/* ADDRESS */}
            {accessToken !== 'GUEST' && (
              <TouchableOpacity
                style={styles.addressBox}
                onPress={() => navigation.navigate(Address)}>
                <Text style={styles.addressTitle}>Delivery Address</Text>
                <Text numberOfLines={1} style={styles.addressText}>
                  {selectedAddress
                    ? `${selectedAddress?.pincode}, ${selectedAddress?.address}`
                    : 'Add Address'}
                </Text>
              </TouchableOpacity>
            )}

            {/* BILL */}
            <View style={styles.row}>
              <Text>Sub-Total</Text>
              <Text>₹{data?.total_gram_invoice_amount}</Text>
            </View>

            <View style={styles.row}>
              <Text>Delivery Fee</Text>
              <Text>₹{deliveryCharges}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.row}>
              <Text style={{fontWeight: 'bold'}}>Total</Text>
              <Text style={{fontWeight: 'bold'}}>
                ₹{total - cartCoupon?.coupanPrice}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.checkoutBtn}
              onPress={() => {
                if (accessToken == 'GUEST') {
                  store.dispatch({type: 'RESET'});
                } else if (!selectedAddress) {
                  showToast('Please Add Address');
                } else {
                  navigation.navigate(Paymentscreen);
                }
              }}>
              <Text style={styles.checkoutText}>Select Payment Method</Text>
            </TouchableOpacity>
          </View>

          {isModalVisible && (
            <ListModal
              isVisible={isModalVisible}
              data={allCoupan}
              onClose={() => setModalVisible(false)}
              onSelect={handleSelectItem}
            />
          )}
        </>
      ) : (
        <NoDataFound text="No item in cart" />
      )}
    </SafeAreaView>
  );
};

export default Cart;

const styles = StyleSheet.create({

card: {
  flexDirection: 'row',
  backgroundColor: '#fff',
  marginHorizontal: 15,
  marginVertical: 8,
  padding: 12,
  borderRadius: 20,
  elevation: 4,
  alignItems: 'center',
},

image: {
  width: 70,
  height: 70,
  borderRadius: 15,
},

title: {
  fontSize: 15,
  fontWeight: '600',
},

desc: {
  fontSize: 12,
  color: '#888',
},

price: {
  color: '#34A853',
  fontWeight: 'bold',
},

qtyBox: {
  flexDirection: 'row',
  backgroundColor: '#34A853',
  borderRadius: 20,
  paddingHorizontal: 10,
  paddingVertical: 5,
},

minus: {fontSize: 18,color:"#fff"},
plus: {fontSize: 18, fontWeight: 'bold' ,color:"#fff"},
qty: {marginHorizontal: 6,color:"#fff"},

couponBox: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#fff3e6',
  padding: 12,
  borderRadius: 15,
  margin: 15,
},

couponText: {
  marginLeft: 8,
 color: '#34A853',
  fontWeight: '600',
},

bottom: {
  position: 'absolute',
  bottom: 0,
  width: '100%',
  backgroundColor: '#fff',
  borderTopLeftRadius: 25,
  borderTopRightRadius: 25,
  padding: 20,
},

addressBox: {
  backgroundColor: '#f9f9f9',
  padding: 12,
  borderRadius: 12,
  marginBottom: 10,
},

addressTitle: {
  fontWeight: 'bold',
},

addressText: {
  color: '#666',
},

row: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginVertical: 5,
},

divider: {
  height: 1,
  backgroundColor: '#eee',
  marginVertical: 8,
},

checkoutBtn: {
  backgroundColor: '#34A853',
  padding: 15,
  borderRadius: 30,
  alignItems: 'center',
  marginTop: 10,
},

checkoutText: {
  color: '#fff',
  fontWeight: 'bold',
},

});