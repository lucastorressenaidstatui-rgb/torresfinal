import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Home from "./pages/home";
import Audio from "./pages/audio";
import Camera from "./pages/camera";
import Acelerometro from "./pages/acelerometro";
import Gps from "./pages/gps";
import Notificacao from "./pages/notification";

import { colors } from './components/theme';
import { StatusBar } from 'expo-status-bar';
import { NotificationSoundProvider } from './services/notificationSound';

const Stack = createNativeStackNavigator();

export default function App(){



  return(

    <NotificationSoundProvider><NavigationContainer><StatusBar style="light" />
      <Stack.Navigator initialRouteName="Home" screenOptions={{ headerStyle: { backgroundColor: colors.background }, headerTintColor: '#fff', headerTitleStyle: { fontWeight: '800' }, contentStyle: { backgroundColor: colors.background } }}>
        <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
        <Stack.Screen name="Audio" component={Audio} />
        <Stack.Screen name="Camera" component={Camera} />
        <Stack.Screen name="Acelerometro" component={Acelerometro} />
        <Stack.Screen name="Gps" component={Gps} />
        <Stack.Screen name="Notificacao" component={Notificacao} />

      </Stack.Navigator>
    </NavigationContainer></NotificationSoundProvider>


  )

}
