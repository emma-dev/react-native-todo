import React, { useReducer, useContext } from 'react'
import {Alert} from 'react-native'
import { TodoContext } from './todoContext'
import { todoReducer } from './todoReducer'
import { ADD_TODO, CLEAR_ERROR, FETCH_TODOS, HIDE_LOADER, REMOVE_TODO, SHOW_ERROR, SHOW_LOADER, UPDATE_TODO } from '../types'
import { ScreenContext } from '../screen/screenContext'
import {Http} from '../../http'
export const TodoState = ({ children }) => {
  const initialState = {
    todos: [],
    loading: false,
    error: null
  }
  const { changeScreen } = useContext(ScreenContext)
  const [state, dispatch] = useReducer(todoReducer, initialState)

  const addTodo = async title => {
clearError()
    try {
      const data = await Http.post('https://rn-todo-app-c8284-default-rtdb.firebaseio.com/todos.json', {title})
      dispatch({ type: ADD_TODO, title, id: data.name })
    }catch(e){
      showError('Oops! Something went wrong...')
    }

 
}
  const removeTodo = id => {
    const todo = state.todos.find(t => t.id === id)
         Alert.alert(
           'Delete Element',
           `Are you sure to delete "${todo.title}"? `,
           [
           {
              text: 'Cancel',
               style: 'cancel'
            },
             { text: 'Remove', 
            style:'destructive',
             onPress: async () => {
              changeScreen(null)
              await Http.delete(`https://rn-todo-app-c8284-default-rtdb.firebaseio.com/todos/${id}.json`)
               
              dispatch({ type: REMOVE_TODO, id })
           } }
          ])
        
  }

  const fetchTodos = async () => {
  showLoader()
  clearError()
  try{
    const data = await Http.get('https://rn-todo-app-c8284-default-rtdb.firebaseio.com/todos.json')
    const todos = Object.keys(data).map(key  => ({ ...data[key], id: key }))
    setTimeout(() => dispatch({type: FETCH_TODOS, todos}), 5000)
    

  }catch (e){
    showError('Oops! Something went wrong...')

  }finally{
    hideLoader()
  }
 
  }

  const updateTodo = async  (id, title) =>{

    clearError()
    try{

    
      await Http.patch(`https://rn-todo-app-c8284-default-rtdb.firebaseio.com/todos/${id}.json`)
      dispatch({ type: UPDATE_TODO, id, title })

    }catch(e){
      showError('Oops! Something went wrong...')
    }
   
  }
  const showLoader = ( ) => dispatch({type: SHOW_LOADER})
  const hideLoader = ( ) => dispatch({type: HIDE_LOADER})
  const showError = error => dispatch({type:SHOW_ERROR})
  const clearError = () => dispatch({type:CLEAR_ERROR})


  return (
    <TodoContext.Provider
      value={{
        todos: state.todos,
        loading: state.loading,
        error : state.error,
        addTodo,
        removeTodo,
        updateTodo,
        fetchTodos
      }}
    >
      {children}
    </TodoContext.Provider>
  )
}
