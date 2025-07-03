import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native'
import React, { useMemo } from 'react'
import UserPlaceholder from '../../assets/icons/UserPlaceholder';
import { MediaBaseURL } from '../../shared/utils/constants';

const HomeDialysis: React.FC<any> = React.memo(({
    hospital,
    onPressContinue,
    onPressPackageList
}) => {

    const getMinimumPriceForPackage = (packageDetail: any) => {
        if (!packageDetail || !Array.isArray(packageDetail) || packageDetail.length === 0) {
            return 0;
        }

        // Find the minimum SessionPrice from all packages
        const minPrice = Math.min(...packageDetail.map((pkg: any) => pkg.SessionPrice || 0));
        return minPrice.toFixed(0);
    }

    const providerInfo = useMemo(() => (
        <>
            <View>
                <View style={[{ flexDirection: 'row', width: '100%' }]}>

                    <View style={{ width: '30%' }}>
                        {hospital?.ImagePath || hospital?.LogoImagePath ? (
                            <Image
                                source={{ uri: `${MediaBaseURL}/${hospital?.ImagePath || hospital?.LogoImagePath}` }}
                                style={styles.providerImage}
                                resizeMode="cover"
                            />
                        ) : (
                            <UserPlaceholder width={80} height={80} />
                        )}
                    </View>
                    <View style={{ width: '70%' }}>
                        <Text style={styles.providerName}>{hospital?.TitleSlang}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 2 }}>
                            <Text style={styles.ratingText}>{hospital?.AccumulativeRatingAvg.toFixed(1)}</Text>
                            <Text style={{ color: '#888', fontSize: 12 }}> ({hospital?.AccumulativeRatingNum} تقييم)</Text>
                            <Text style={{ color: '#FFD700', marginLeft: 2 }}>★</Text>
                        </View>
                    </View>


                </View>
                <View style={{ marginTop: 10, width: '100%' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', width: '100%' }}>
                        <Text style={{ fontSize: 14, color: '#222' }}>{`رسوم الاستشارة عن بعد للتقييم المبدئي :`}</Text>
                        <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#239ea0', marginLeft: 8, }}>{`${hospital?.RemoteSessionStartPrice} ريال`}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', width: '100%' }}>
                        <Text style={{ fontSize: 14, color: '#222' }}>{`رسوم زيارة الطبيب المنزلية للتقييم النهائي :`}</Text>
                        <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#239ea0', marginLeft: 8, }}>{`${hospital?.HomeVisitStartPrice} ريال`}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', width: '100%' }}>
                        <Text style={{ fontSize: 14, color: '#222' }}>{`سعر الجلسة يبدأ من :`}</Text>
                        <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#239ea0', marginLeft: 8 }}>{`${getMinimumPriceForPackage(hospital?.PackageDetail)} ريال`}</Text>
                        <Text style={{ fontSize: 14, color: '#222', marginLeft: 8 }}>{`حسب الباقة`}</Text>
                    </View>
                </View>
            </View>
        </>
    ), [hospital]);

    return (
        <View style={[styles.providerCard]}>
            {providerInfo}
            <View style={{ flexDirection: 'row', marginTop: 10, width: '100%', alignItems: 'center', justifyContent: 'space-between' }}>
                <TouchableOpacity onPress={() => onPressPackageList(hospital)} style={{ width: '48%', backgroundColor: '#dceff0', padding: 10, borderRadius: 10 }}>
                    <Text style={{ color: '#239ea0', fontSize: 16, fontWeight: 'bold', textAlign: 'center' }}>اسعار الباقات</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onPressContinue(hospital)} style={{ width: '48%', backgroundColor: '#239ea0', padding: 10, borderRadius: 10 }}>
                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold', textAlign: 'center' }}>حجز موعد</Text>
                </TouchableOpacity>
            </View>

        </View>
    )
})

const styles = StyleSheet.create({
    providerCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
        alignItems: 'center',
        position: 'relative',
    },
    providerImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#e0e0e0',
        marginBottom: 8,
    },
    providerName: {
        fontWeight: 'bold',
        fontSize: 16,
        marginTop: 4,
        marginBottom: 2,
        color: '#222',
        flexWrap: 'wrap',
        alignSelf: 'flex-start',
    },
    ratingText: {
        color: '#222',
        fontWeight: 'bold',
        fontSize: 14,
    },
})

export default HomeDialysis