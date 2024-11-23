"use client";

import { useRef, Fragment, memo } from "react";
import { proxy, useSnapshot } from "valtio";

type Status = "pending" | "completed";
type Filter = Status | "all";
type Todo = {
  description: string;
  status: Status;
  id: number;
};

export const store = proxy<{ filter: Filter; todos: Todo[] }>({
  filter: "all",
  todos: [],
});

const addTodo = (description: string) => {
  store.todos.push({
    description,
    status: "pending",
    id: Date.now(),
  });
};

const removeTodo = (id: number) => {
  const index = store.todos.findIndex((todo) => todo.id === id);
  if (index >= 0) {
    store.todos.splice(index, 1);
  }
};

const toggleDone = (id: number, currentStatus: Status) => {
  const nextStatus = currentStatus === "pending" ? "completed" : "pending";
  const todo = store.todos.find((todo) => todo.id === id);
  if (todo) {
    todo.status = nextStatus;
  }
};

const setFilter = (filter: Filter) => {
  store.filter = filter;
};

const filterValues: Filter[] = ["all", "pending", "completed"];

const Filters = () => {
  console.log("Render Filters");

  const snap = useSnapshot(store);
  return (
    <nav>
      {filterValues.map((filter) => (
        <Fragment key={filter}>
          <input
            name="filter"
            type="radio"
            value={filter}
            checked={snap.filter === filter}
            onChange={() => setFilter(filter)}
          />
          <label>{filter}</label>
        </Fragment>
      ))}
    </nav>
  );
};

const Todo = (props: { todo: Todo }) => {
  console.log("Render Todo", props);

  return (
    <li key={props.todo.id}>
      <span
        className={
          props.todo.status === "completed" ? "line-through" : undefined
        }
        onClick={() => toggleDone(props.todo.id, props.todo.status)}
      >
        {props.todo.description}
      </span>
      <button
        className="bg-cyan-300 px-3 py-1 rounded"
        onClick={() => removeTodo(props.todo.id)}
      >
        x
      </button>
    </li>
  );
};

const MemoizedTodo = memo(Todo);

const Todos = () => {
  console.log("Render Todos");

  const snap = useSnapshot(store);
  return (
    <ul>
      {snap.todos
        .filter(({ status }) => status === snap.filter || snap.filter === "all")
        .map((todo) => {
          return <MemoizedTodo key={todo.id} todo={todo} />;
        })}
    </ul>
  );
};

const CreateTodo = () => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <section>
      <input
        className="border"
        name="description"
        type="text"
        minLength={2}
        ref={inputRef}
      />
      <button
        className="bg-cyan-300 px-3 py-1 rounded"
        onClick={() => addTodo(inputRef.current?.value ?? "")}
      >
        Add new
      </button>
    </section>
  );
};

const App = () => {
  console.log("Render App");

  return (
    <main>
      <h1>
        To-do List{" "}
        <span role="img" aria-label="pen">
          ✏️
        </span>
      </h1>
      <Filters />
      <Todos />
      <CreateTodo />
    </main>
  );
};

export default App;
