import { View, Text, SafeAreaView, TouchableOpacity, StyleSheet, ScrollView, FlatList, I18nManager } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next';
import Header from '../../components/common/Header';
import BackIcon from '../../assets/icons/BackIcon';
import { useNavigation } from '@react-navigation/native';
import ServiceCard from '../../components/ServiceCards';
import ArrowRightIcon from '../../assets/icons/RightArrow';
import LinearGradient from 'react-native-linear-gradient';
import { bookingService } from '../../services/api/BookingService';
import OnlineDoctorIcon from '../../assets/icons/OnlineDoctorIcon';
import HomeVisitIcon from '../../assets/icons/HomeVisitIcon';
import FullScreenLoader from '../../components/FullScreenLoader';
import HomeVisitCard from '../../components/HomeVisitCard';
import { ROUTES } from '../../shared/utils/routes';
import { setCategory } from '../../shared/redux/reducers/bookingReducer';
import { useDispatch } from 'react-redux';


const Services = ({ navigation }: any) => {
    const { t } = useTranslation();
    const [services, setServices] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isHomeVisit, setIsHomeVisit] = useState(false);
    const [homeVisit, setHomeVisit] = useState<any[]>([]);
    const dispatch = useDispatch();
    useEffect(() => {
        getServices();
    }, []);

    const getServices = async () => {
        setIsLoading(true);
        const response = await bookingService.getServices();
        if (response && response.OfferedCategories) {
            const onlineBooking = response.OfferedCategories.filter((item: any) => item.Id === "42");
            const homeVisitArr = response.OfferedCategories.filter((item: any) => item.Id !== "42");
            setHomeVisit(homeVisitArr);
            // Get item with minimum price from each array
            const minOnlineBooking = onlineBooking.reduce((min: any, item: any) =>
                item.Price < min.Price ? item : min, onlineBooking[0]);
            const minHomeVisit = homeVisitArr.reduce((min: any, item: any) =>
                item.Price < min.Price ? item : min, homeVisitArr[0]);

            // Map to required object structure
            const services = [
                {
                    Id: minOnlineBooking.Id,
                    title: "الطب الاتصالي",
                    description: "استشارات طبية عن بُعد في جميع التخصصات الصحية",
                    Price: minOnlineBooking.Price,
                    Image: <OnlineDoctorIcon width={200} height={200} />,
                    ...minOnlineBooking
                },
                {
                    Id: minHomeVisit.Id,
                    title: "الرعاية المنزلية",
                    description: "خدمات طبية تقدم لك في منزلك بكل سهولة وراحة",
                    Price: minHomeVisit.Price,
                    Image: <HomeVisitIcon width={200} height={200} />
                }
            ];

            setServices(services);
        }
        setIsLoading(false);
    }

    const renderHeader = () => (
        <Header
            centerComponent={
                <Text style={styles.headerTitle}>{isHomeVisit ? "الرعاية المنزلية" : "خدمات"}</Text>
            }
            leftComponent={
                <TouchableOpacity onPress={() => isHomeVisit ? setIsHomeVisit(false) : navigation.goBack()} style={styles.bookButton}>
                    {I18nManager.isRTL ?  <ArrowRightIcon /> : <BackIcon />}
                </TouchableOpacity>
            }
            containerStyle={styles.headerContainer}
        />
    );
    const onPressService = (service: any) => {
        if (service.Id != "42") {
            setIsHomeVisit(true);
        } else {
            dispatch(setCategory(service));
            navigation.navigate(ROUTES.BookingScreen);
        }
    }

    const onPressHomeVisit = (service: any) => {
        dispatch(setCategory(service));
        navigation.navigate(ROUTES.LocationScreen);
    }

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient
                colors={['rgba(39,165,153,0.47)', '#54b196']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0.515, y: 0.5 }}
                style={styles.container}
            >
                {renderHeader()}
                {isHomeVisit ? (
                    <FlatList
                        data={homeVisit}
                        renderItem={({ item, index }) => <HomeVisitCard item={item} index={index} onPress={() => onPressHomeVisit(item)} />}
                        keyExtractor={item => item.Id}
                        numColumns={2}
                        contentContainerStyle={{ padding: 10 }}
                    />
                ) : (
                    <ScrollView>
                        <View style={styles.servicesContainer}>
                            {services.map(service => (
                                <ServiceCard
                                    key={service.Id}
                                    item={service}
                                    style={{ marginBottom: 20 }}
                                    onPress={() => onPressService(service)}
                                />
                            ))}
                        </View>
                    </ScrollView>
                )}
            </LinearGradient>
            <FullScreenLoader visible={isLoading} />
        </SafeAreaView>
    )
}

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
    },
    bookButton: {
        padding: 5,
        paddingLeft: 0,
    },
    bookButtonText: {
        color: '#fff',
    },
    headerContainer: {
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    servicesContainer: {
        padding: 10,
        paddingTop: 20,
    },
    serviceItem: {
        height: 300,
        marginBottom: 10,
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        padding: 10,
    },
});

export default Services