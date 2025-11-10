import { View, FlatList, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import ExerciseCard from "./ExerciseCard";

export default function ExerciseList({ item, bodyPartId }) {
  const router = useRouter();

  return (
    <View>
      <FlatList
        data={item}
        numColumns={2}
        keyExtractor={(item, index) => item.name + "-" + index}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.flat}
        columnWrapperStyle={styles.flat2}
        renderItem={({ item, index }) => (
          <ExerciseCard
            item={item}
            index={index}
            router={router}
            bodyPartId={bodyPartId}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flat: {
    paddingBottom: 50,
    paddingTop: 20,
  },
  flat2: {
    justifyContent: "space-between",
  },
});
