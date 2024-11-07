import React from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';

export type HeadProps = {
    debug?: boolean,
    uuid: string,
    headSize: number,
    overlay: boolean,
    style?: StyleProp<ImageStyle>
}

const Head = (props: HeadProps) => {

    const { uuid, headSize, overlay, style, debug } = props;

    return (
        <Image style={[{width: headSize, height: headSize}, style]} src={`https://crafatar.com/avatars/${uuid}?size=${headSize}${overlay?'&overlay':''}`} />
    );
};

export default Head;