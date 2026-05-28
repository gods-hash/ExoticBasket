import React, {useState} from 'react';
import {View, ActivityIndicator, Image} from 'react-native';
import imgPath from '../constants/imgPath';

const MyImgCompo = ({imageUri, ImgCompoStyle, resizeMode = 'contain', otherComponents}) => {
  const [imgLoading, setImgLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <View>
      
      <Image
        style={[ImgCompoStyle, {overflow: 'hidden'}]}
        source={hasError ? imgPath.noImg : {uri: imageUri}}
        resizeMode={resizeMode}
        onLoadStart={() => {
          setImgLoading(true);
          setHasError(false);
        }}
        onLoadEnd={() => setImgLoading(false)}
        onError={() => {
          setHasError(true);
          setImgLoading(false);
        }}
      />

      {imgLoading && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}

      {otherComponents}
    </View>
  );
};

export default MyImgCompo;