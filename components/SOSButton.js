

export default function SOSButton() {

  return (
    <TouchableOpacity 
      style={styles.sosButton} 
      onPress={() => {
        console.log("🚀 Button Press Detected!");
        sendSOSAlert();
      }}
    >
      <FontAwesome name="exclamation-circle" size={35} color="white" />
    </TouchableOpacity>
  );
}
