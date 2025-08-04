import React, { useEffect, useState } from "react";
import { View, Text, FlatList, RefreshControl, StyleSheet, Dimensions } from "react-native";
import { profileService } from "../../../services/api/ProfileService";
import NoAppointmentsIcon from '../../../assets/icons/NoAppointmentsIcon';
import { useTranslation } from "react-i18next";
import FullScreenLoader from "../../../components/FullScreenLoader";
import VisitItemRender from "./VisitItemRender";
import { CAIRO_FONT_FAMILY } from '../../../styles/globalStyles';

const windowHeight = Dimensions.get('window').height;

const PreviousVisitAppointments = ({ userId }: any) => {
    const { t } = useTranslation();
    const [previousVisitAppointments, setPreviousVisitAppointments] = useState([]);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isLoading, setIsLoading] = useState(false)
    useEffect(() => {
        getVisitOrderList();
    }, [userId]);

    const getVisitOrderList = async () => {
        try {
            setIsLoading(true)
            const payload = {
                "UserloginInfoId": userId,
                "OrderMainStatus": "-1",
                "OrderStatusId": null
            }
            const response = await profileService.getVisitOrderList(payload);
            if (response.ResponseStatus.STATUSCODE == 200) {
                setPreviousVisitAppointments(response.UserOrders);
            }
            setIsLoading(false)
            setIsRefreshing(false)
        } catch (error: any) {
            setIsLoading(false)
            setIsRefreshing(false)
        }
    }

    const refreshList = () => {
        if (!isRefreshing) {
            setIsRefreshing(true);
            getVisitOrderList();
        }
    };

    const getUniqueId = () => {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    return (
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
            <FlatList
                data={previousVisitAppointments}
                renderItem={({item}:any) => <VisitItemRender item={item} />}
                keyExtractor={(item) => getUniqueId()}
                contentContainerStyle={styles.contentContainer}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={refreshList}
                        colors={['#008080']}
                    />
                }
                removeClippedSubviews={true}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContentContainer}>
                        <NoAppointmentsIcon />
                        <Text style={styles.text}>{t('no_appointments')}</Text>
                    </View>
                )}
                maxToRenderPerBatch={10}
                windowSize={10}
                initialNumToRender={5}
            />

            <FullScreenLoader visible={isLoading} />
        </View>
    )
}

const styles = StyleSheet.create({
    emptyContentContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        height: windowHeight - 200,
    },
    contentContainer: {
        padding: 16,
    },
    text: {
        fontSize: 16,
        color: '#000',
        fontFamily: CAIRO_FONT_FAMILY.regular,
    },
})

export default PreviousVisitAppointments;