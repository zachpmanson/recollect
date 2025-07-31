import useDb from "@/db/useDb";
import { Button } from "@react-navigation/elements";
import { useEffect, useState } from "react";

import { Text, TouchableOpacity, View } from "react-native";
interface Todo {
  id: number;
  value: string;
  intValue: number;
}

export default function Todo() {
  const db = useDb();
  const [todos, setTodos] = useState<Todo[]>([]);

  const [schema, setSchema] = useState("default");

  async function setup() {
    const result = await db.db.getAllAsync<Todo>("SELECT * FROM images");
    setTodos(result);
  }

  async function addTodo() {
    // await db.run(
    //   `INSERT INTO todos (value, intValue) VALUES (?, ?)`,
    //   new Date().toISOString(),
    //   Math.floor(Math.random() * 1000)
    // );
    await setup();
  }

  async function deleteTodo(id: number) {
    await db.run(`DELETE FROM todos WHERE id = ?;`, id);
    await setup();
  }

  useEffect(() => {
    setup().then();
  }, []);

  return (
    <View>
      <Button onPress={() => addTodo().then()}>Add</Button>
      <Text>{schema}</Text>
      {todos.map((todo, index) => (
        <TouchableOpacity key={index} onPress={() => deleteTodo(todo.id).then()}>
          <Text>{`${JSON.stringify(todo, null, 2)}`}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
