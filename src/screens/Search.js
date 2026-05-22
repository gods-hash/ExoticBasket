import React, {useCallback, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  FlatList,
  Image,
  Pressable,
  Alert,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation, useTheme} from '@react-navigation/native';
import {scale, textScale} from '../styles/responsiveSize';
import NoDataFound from '../Components/NoDataFound';
import Units from '../Components/Units';
import {
  Addtocartaction,
  Cartget,
  searchItemMethod,
} from '../redux/actions/UserAction';
import {BASE_URL} from '../apiEndpoints/Base_Url';
import CartBar from '../Components/CartBar';

const Search = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const colors = useTheme().colors;
  const {storeId, saasId, id} = useSelector(
    state => state?.auth?.data?.customer_data,
  );

  const product = useSelector(state => state?.auth?.data?.customer_data);
  const searchResponse = useSelector(state => state?.product?.search);

  const [weights, setWeights] = useState({}); // Store selected weights for each item
  const [refreshFlatList, setRefreshFlatList] = useState(false); // To trigger FlatList re-render

  const searchItem = search => {
    dispatch(searchItemMethod(product?.storeId, product?.saasId, search));
  };
const cartData = useSelector(state => state?.product?.cart);
console.log("CART DATA 👉", cartData);

  const handleWeightChange = (weight, itemId) => {
    setWeights(prev => {
      const updatedWeights = {...prev, [itemId]: weight};
      setRefreshFlatList(!refreshFlatList); // Toggle refreshFlatList
      return updatedWeights;
    });
  };

const products =
  cartData?.data?.products ||
  cartData?.data?.items ||
  cartData?.productsList ||
  cartData?.cartItems ||
  [];

const totalItems = products.length;

const totalAmount = products.reduce(
  (sum, item) => sum + (item?.new_price || item?.price || 0),
  0
);
  const renderItem = useCallback(
    ({item}) => {
      const originalPrice = item?.actual_price || 0;
      const discountedPrice = item?.price || 0;

      const discountAmount = originalPrice - discountedPrice;
      const percentageOff =
        originalPrice > 0
          ? ((discountAmount / originalPrice) * 100).toFixed(0) + '%'
          : '0%';

      const currentWeight = weights[item?.item_id] || 0; // Default to 1000g
      const finalPrice =
        Math.round((currentWeight / 1000) * (item?.price || 0)) || item?.price;

      const storeData = async () => {
const currentWeight = weights[item?.item_id] || 0;

        let body = JSON.stringify({
          item_id: item?.item_id,
          item_name: item?.item_name,
          category: item?.category,
          message: 'This is an example cart item.',
          itemCode: null,
          sku: 'SKU123',
          description: item?.item_name,
          price: item?.price,
          mrp: item?.actual_price,
          new_price: finalPrice,
          discount: item?.discount,
          status: item?.status,
          department: 'no departments',
          saas_id: saasId,
          store_id: item?.store_id,
          promoId: item?.promo_id,
          item_quantity: item?.product_qty,
          gram: currentWeight,
          hsnCode: item?.hsn_code,
          taxRate: item?.tax_rate,
          taxCode: item?.tax_code,
          taxPercent: item?.tax_percent,
          actual_price: item?.actual_price,
        });
        console.log('Store Data:', body, '<<<>>>>>', item);

       const res = await dispatch(
  Addtocartaction(body, product?.saasId, product?.storeId, product?.id),
);

// ❌ condition hata do
await dispatch(
  Cartget(product?.saasId, product?.storeId, product?.id)
);
      };

      return (
        <Pressable
          onPress={() =>
            navigation.push('ItemDetails', {item, totalOff: percentageOff})
          }>
          <View style={styles.itemContainer}>
            <Image
              source={{
                uri: `${BASE_URL}item/get-image/${
                  item.item_id
                }?key=${new Date()}`,
              }}
              style={styles.itemImage}
            />
            <View style={styles.itemDetails}>
              <Text numberOfLines={1} style={styles.itemName}>
                {item?.item_name?.charAt(0).toUpperCase() +
                  item?.item_name?.slice(1)}
              </Text>
              <Text
                numberOfLines={1}
                style={[
                  styles.itemPrice,
                  {textDecorationLine: 'line-through'},
                ]}>
                {item?.actual_price > 0 ? `₹${item?.actual_price}` : ''}
              </Text>
              <Text numberOfLines={1} style={styles.itemPrice}>
                Price: ₹{finalPrice}
              </Text>
            </View>
<View
  style={{
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  }}
>
  {/* ✅ WEIGHT FIRST */}
  <View
    style={{
      backgroundColor: '#E6F4EA',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
    }}
  >
    <Units
      title={`${weights[item?.item_id] || 100} g`}
      onSelect={weight => handleWeightChange(weight, item?.item_id)}
    />
  </View>

  {/* ✅ ADD BUTTON */}
  <Pressable
  onPress={() => {
 if (!currentWeight) {
  Alert.alert("Please select weight first");
  return;
} // ❌ block if not selected
    storeData();
  }}
    style={{
      backgroundColor: "#34A853",
      paddingHorizontal: 18,
      paddingVertical: 8,
      borderRadius: 10,
    }}
  >
    <Text
      style={{
        color: "#fff",
        fontWeight: "600",
        fontSize: 14,
      }}
    >
      ADD
    </Text>
  </Pressable>
</View>
          </View>
        </Pressable>
      );
    },
    [weights],
  ); // Add weights as a dependency

  return (
    <View style={{flex: 1, backgroundColor: '#fff', marginTop:"20%"}}>
      <View style={styles.searchContainer}>
        <Icon name="magnify" style={styles.searchIcon} color="#000" />
        <TextInput
          placeholder="Search"
          placeholderTextColor="grey"
          onChangeText={text => searchItem(text)}
          style={styles.searchInput}
          autoFocus
        />
      </View>
      <View style={styles.container}>
        {searchResponse && searchResponse.length > 0 ? (
          <FlatList
            data={searchResponse}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
            showsVerticalScrollIndicator={false}
            extraData={refreshFlatList} // Ensure FlatList re-renders
          />
        ) : (
          <NoDataFound
            text="No Search Results"
            iconName="text-search"
            iconSize={30}
          />
        )}
      </View>
      <CartBar
  totalItems={totalItems}
  totalAmount={totalAmount}
  onPress={() => navigation.navigate('Cart')}
/>
    </View>
  );
};

export default Search;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: scale(8),
    marginHorizontal: scale(8),
    backgroundColor: '#fff',
  },
searchContainer: {
  flexDirection: 'row',
  alignItems: 'center',

  margin: 10,
  paddingHorizontal: 10,
  paddingVertical: 6,

  borderRadius: 10,

  backgroundColor: '#F3F4F6', // light grey (clean look)
},
  searchIcon: {
    fontSize: 25,
    left: 5,
  },
  searchInput: {
    fontSize: textScale(18),
    paddingLeft: scale(8),
    flex: 1,
    color: '#000',
    backgroundColor: '#fff',
  },
itemContainer: {
  flexDirection: 'row',
  alignItems: 'center',

  paddingVertical: 12,
  paddingHorizontal: 10,

  borderBottomWidth: 1, // 🔥 thin divider
  borderBottomColor: '#E5E7EB', // light grey

  backgroundColor: '#fff',
},
 itemImage: {
  width: 70,
  height: 70,
  borderRadius: 10,
  marginRight: 10,
},
  itemDetails: {
    flex: 1,
  },
itemName: {
  fontSize: 16,
  fontWeight: '600',
  color: '#111',
},

itemPrice: {
  fontSize: 14,
  color: '#555',
  marginTop: 2,
},
});