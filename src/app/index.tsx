	import { View, Text, Pressable } from 'react-native';

	export default function HomeScreen() {
	  return (
	    <View
	      style={{
		flex: 1,
		backgroundColor: '#0f172a',
		justifyContent: 'center',
		alignItems: 'center',
		padding: 20,
	      }}
	    >
	      <Text
		style={{
		  color: 'white',
		  fontSize: 38,
		  fontWeight: 'bold',
		  marginBottom: 20,
		}}
	      >
		KAMAY 🚀
	      </Text>

	      <Text
		style={{
		  color: '#cbd5e1',
		  fontSize: 18,
		  textAlign: 'center',
		  marginBottom: 30,
		}}
	      >
		Plataforma para emprendedores bolivianos
	      </Text>

	      <Pressable
		onPress={() => alert('Bienvenido a KAMAY')}
		style={{
		  backgroundColor: '#22c55e',
		  paddingVertical: 15,
		  paddingHorizontal: 30,
		  borderRadius: 15,
		}}
	      >
		<Text
		  style={{
		    color: 'white',
		    fontWeight: 'bold',
		    fontSize: 16,
		  }}
		>
		  Empezar
		</Text>
	      </Pressable>
	    </View>
	  );
	}
