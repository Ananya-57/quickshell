import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

import './App.css';
import List from './Components/List/List';
import Navbar from './Components/Navbar/Navbar';

function App() {
  const statusList = ['Backlog', 'Todo','In progress', 'Done', 'Cancelled'];
  const priorityList = [
    { name: 'No priority', priority: 0 },
    { name: 'Low', priority: 1 },
    { name: 'Medium', priority: 2 },
    { name: 'High', priority: 3 },
    { name: 'Urgent', priority: 4 },
  ];

  const [groupValue, setGroupValue] = useState(getStateFromLocalStorage() || 'status');
  const [orderValue, setOrderValue] = useState('title');
  const [ticketDetails, setTicketDetails] = useState([]);
  const [userDetails, setUserDetails] = useState([]);

  const orderDataByValue = useCallback(async (cardsArray) => {
    if (orderValue === 'priority') {
      cardsArray.sort((a, b) => b.priority - a.priority);
    } else if (orderValue === 'title') {
      cardsArray.sort((a, b) => {
        const titleA = a.title.toLowerCase();
        const titleB = b.title.toLowerCase();

        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
    }
    setTicketDetails(cardsArray);
  }, [orderValue]);

  function saveStateToLocalStorage(state) {
    localStorage.setItem('groupValue', JSON.stringify(state));
  }

  function getStateFromLocalStorage() {
    const storedState = localStorage.getItem('groupValue');
    return storedState ? JSON.parse(storedState) : null; 
  }

  useEffect(() => {
    saveStateToLocalStorage(groupValue);
    
    async function fetchData() {
      try {
        const response = await axios.get('https://api.quicksell.co/v1/internal/frontend-assignment');
        if (response.status === 200) {
          setUserDetails(response.data.users); // Set fetched users
          refactorData(response.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData();

    async function refactorData(data) {
      const ticketArray = data.tickets.map(ticket => {
        const user = data.users.find(user => user.id === ticket.userId);
        return { ...ticket, userObj: user };
      });
      setTicketDetails(ticketArray);
      orderDataByValue(ticketArray);
    }
  }, [orderDataByValue, groupValue]);

  function handleGroupValue(value) {
    setGroupValue(value);
  }

  function handleOrderValue(value) {
    setOrderValue(value);
  }
  
  return (
    <>
      <Navbar
        groupValue={groupValue}
        orderValue={orderValue}
        handleGroupValue={handleGroupValue}
        handleOrderValue={handleOrderValue}
      />
      <section className="board-details">
        <div className="board-details-list">
          {
            {
              'status': <>
                {
                  statusList.map((listItem) => (
                    <List
                      key={listItem}
                      groupValue='status'
                      orderValue={orderValue}
                      listTitle={listItem}
                      listIcon=''
                      statusList={statusList}
                      ticketDetails={ticketDetails}
                    />
                  ))
                }
              </>,
              'user': <>
                {
                  userDetails.map((user) => (
                    <List
                      key={user.id}
                      groupValue='user'
                      orderValue={orderValue}
                      listTitle={user.name}
                      listIcon=''
                      ticketDetails={ticketDetails}
                    />
                  ))
                }
              </>,
              'priority': <>
                {
                  priorityList.map((listItem) => (
                    <List
                      key={listItem.priority}
                      groupValue='priority'
                      orderValue={orderValue}
                      listTitle={listItem.name}
                      listIcon=''
                      ticketDetails={ticketDetails}
                    />
                  ))
                }
              </>
            }[groupValue]
          }
        </div>
      </section>
    </>
  );
}

export default App;
