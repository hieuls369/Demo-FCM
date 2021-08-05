import React, { useState, useEffect, useRef } from 'react';
import { Text, View, Button, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { requestUserPermission, notificationListenerFire } from './FirebaseNoti';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
    }),
});

const FCM_KEY = "AAAApYZ8xZ8:APA91bGgTFt-SAnWD78fjUwYjIjR1NB1t_1afsziDMa7_F-59OFBwJ7sFxcBpyThITuCtSYxY4Y3rE0Kwvp1UG6YRE9A8Bkkz3GCQamgWMG-J1lyBmiL9HdL8DZuuCuh5FdSEE06u3wc";


const NotificationUI = () => {
    const [expoPushToken, setExpoPushToken] = useState('');
    const [notification, setNotification] = useState(false);
    const notificationListener = useRef();
    const responseListener = useRef();

    useEffect(() => {
        // requestUserPermission()
        // notificationListenerFire()
        registerForPushNotificationsAsync().then(token => setExpoPushToken(token));

        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            setNotification(notification);
        });

        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            console.log(response);
        });

        return () => {
            Notifications.removeNotificationSubscription(notificationListener.current);
            Notifications.removeNotificationSubscription(responseListener.current);
        };
    }, []);

    return (
        <View
            style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'space-around',
            }}>
            <Text>Your expo push token: {expoPushToken}</Text>
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                <Text>Title: {notification && notification.request.content.title} </Text>
                <Text>Body: {notification && notification.request.content.body}</Text>
                <Text>Data: {notification && JSON.stringify(notification.request.content.data)}</Text>
            </View>
            <Button
                title="Press to schedule a notification"
                onPress={async () => {
                    await schedulePushNotification();
                }}
            />
        </View>
    );
}
async function schedulePushNotification() {
    console.log("Send!!");
    return await fetch('https://fcm.googleapis.com/fcm/send', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `key=${FCM_KEY}`,
        },
        body: JSON.stringify({
            to: 'f3V8caIXScy9E0QDX1tnb5:APA91bGCRRKM1wAeeg2Tg_hJ6Rws00sEbADThEB4_G19aENEoO3j1yWsJqDmviKFZ8vPjHcktVN1jJXeIc2fNru5MXm_3e4aV4PkDtrTt-mpJJAylYwO5AgbJqMGqyGE6jHI4FQdGbgQ',
            priority: 'normal',
            data: {
                experienceId: '@yourExpoUsername/yourProjectSlug',
                title: "\uD83D\uDCE7 You've got mail",
                message: 'Hello world! \uD83C\uDF10',
            },
        }),
    });

    // await Notifications.scheduleNotificationAsync({
    //     content: {
    //         title: "You've got mail! 📬",
    //         body: 'Here is the notification body',
    //         data: { data: 'goes here' },
    //     },
    //     trigger: { seconds: 2 },
    // });
}

async function registerForPushNotificationsAsync() {
    let token;
    if (Constants.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            alert('Failed to get push token for push notification!');
            return;
        }
        token = (await Notifications.getExpoPushTokenAsync()).data;
        console.log(token);
    } else {
        alert('Must use physical device for Push Notifications');
    }

    if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }
    return token;
}


export default NotificationUI


