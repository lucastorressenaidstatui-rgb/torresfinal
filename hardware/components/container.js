import { View, StyleSheet } from 'react-native';
import { colors } from './theme';
export default function Container({ children }) { return <View style={styles.container}>{children}</View>; }
const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: 20 } });
