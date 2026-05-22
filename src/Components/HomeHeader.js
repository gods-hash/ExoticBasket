import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Pressable, StatusBar, Platform, Image } from 'react-native'
import React from 'react'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native'
import LinearGradient from 'react-native-linear-gradient';
import store from '../redux/Store';

const HomeHeader = () => {

    const navigation = useNavigation()

    const accessToken = useSelector(state => state?.auth?.data?.jwt_response);
    const { name } = useSelector(state => state?.auth?.data?.customer_data || {});

    const handleProfile = () => {
        if (accessToken === 'GUEST') {
            store.dispatch({ type: "RESET" })
        } else {
            navigation.navigate('Profile')
        }
    }

    return (

        <LinearGradient
            colors={['#f4e09d', '#FDDC8C', '#F9E7B3']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
        >

            <View style={styles.container}>

                <View style={styles.topRow}>

                    {/* <TouchableOpacity onPress={handleProfile}>
                        <Icon
                            name={'account-circle-outline'}
                            style={styles.profileIcon}
                        />
                    </TouchableOpacity> */}

                    <View style={styles.deliveryContainer}>

                        <Text style={styles.deliveryLabel}>DELIVERY IN</Text>
                        <Text style={styles.deliveryTime}>30 mins</Text>

                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {
                                accessToken === 'GUEST'
                                    ?
                                    <Pressable onPress={handleProfile}>
                                        <Text style={styles.locationText}>Login</Text>
                                    </Pressable>
                                    :
                                    <Text style={styles.locationText}>
                                        Delivering to {name || 'Customer'}
                                    </Text>
                            }
                        </ScrollView>

                    </View>

                   <TouchableOpacity onPress={handleProfile}>
  <Image
    source={{ uri: "https://i.pravatar.cc/150?img=12" }} // random profile pic
    style={styles.profileCircle}
  />
</TouchableOpacity>
                </View>

                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate('Search')}
                    style={styles.searchBar}
                >

                    <Icon name="magnify" size={22} color="#9CA3AF" />

                    <Text style={styles.searchText}>
                        Search vegetables, fruits...
                    </Text>

                    <Icon name="microphone-outline" size={20} color="#34A853" />

                </TouchableOpacity>

            </View>

        </LinearGradient>

    )
}

export default HomeHeader

const styles = StyleSheet.create({

container:{
paddingHorizontal:16,
paddingTop:10,
paddingBottom:14
},

topRow:{
flexDirection:"row",
alignItems:"center",
justifyContent:"space-between"
},

profileIcon:{
color:"#34A853",
fontSize:36
},

deliveryContainer:{
flex:1,
marginLeft:10
},

deliveryLabel:{
fontSize:10,
color:"#444"
},

deliveryTime:{
fontSize:26,
fontWeight:"bold",
color:"#34A853"
},

locationText:{
fontSize:12,
color:"#222"
},

profileCircle:{
width:38,
height:38,
borderRadius:19,
backgroundColor:"#E5E7EB",
borderWidth:2,
borderColor:"#34A853"
},

searchBar:{
marginTop:14,
backgroundColor:"#f6d878",
borderRadius:20,
paddingVertical:12,
paddingHorizontal:14,
flexDirection:"row",
alignItems:"center"
},

searchText:{
flex:1,
marginLeft:10,
fontSize:14,
color:"#9CA3AF"
}

})