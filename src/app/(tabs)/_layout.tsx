import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HouseIcon, LibraryIcon, LayersIcon } from "lucide-react-native";

export default function TabLayout() {

    const insets = useSafeAreaInsets();

    return (
        <Tabs
            screenOptions={{
                headerShown: false, // esconde o cabeçalho padrao
                tabBarStyle: {
                    backgroundColor: '#0F172A',
                    borderTopColor: '#1E293B',
                    height: 60 + insets.bottom,
                    paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
                },
                tabBarActiveTintColor: '#EAB308',
                tabBarInactiveTintColor: '#64748B',
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Início',
                    tabBarIcon: ({ color }) => <HouseIcon size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="library"
                options={{
                    title: 'Biblioteca',
                    tabBarIcon: ({ color }) => <LibraryIcon size={24} color={color} />,
                }}
            />

        </Tabs>
    )
}