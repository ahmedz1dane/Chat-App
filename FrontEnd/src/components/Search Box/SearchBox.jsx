import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useSelector } from "react-redux";
import "./searchBox.css"; // Import the CSS file

// TODO: LEARN USEREF AND FIND WHY USESTATE DOESNT HELP IN THE SAME SITUATION
//       ALSO FIND WHY CHAT IS NOT CREATED IN CASE OF ahmedz1dane

function SearchBox() {
  // const userData = useSelector((state) => state.auth.userData);
  // console.log("userData: ", userData.data._id);
  const [data, setData] = useState([]); // State to store fetched user data
  const [filteredUsers, setFilteredUsers] = useState([]); // State to store filtered users
  const [searchTerm, setSearchTerm] = useState(""); // State to store search term
  const [showDropdown, setShowDropdown] = useState(false); // State to control dropdown visibility
  const [selectedUsers, setSelectedUsers] = useState([]);
  const userData = useSelector((state) => state.auth.userData);
  const isInitialized = useRef(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const fetchUsers = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/v1/users/allUsers"
      );
      setData(response.data.data);
      // console.log(response); // Update data state with fetched user data
    } catch (error) {
      console.log("Error inside axios in search btn: ", error);
    }
  };

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // TODO: DO AS MENTIONED IN THE NOTEBOOK
  const currentChats = async (currentUserId) => {
    // console.log(currentUserId);
    const response = await axios.get(
      `http://localhost:5000/api/v1/chat/current-chats?currentUserId=${currentUserId}`,
      { currentUserId }
    );
    response.data.chats.forEach((chat) => {
      const currentSlectedUser = {
        id: chat.participantsDetails[0]._id,
        name: chat.participantsDetails[0].username,
        avatar: chat.participantsDetails[0].avatar,
      };
      // console.log(currentSlectedUser);
      setSelectedUsers((prevSelectedUsers) => [
        ...prevSelectedUsers,
        currentSlectedUser,
      ]);
    });
  };

  // console.log("selected Users: ", selectedUsers);
  useEffect(() => {
    if (!isInitialized.current) {
      const currentUserId = userData.data._id;
      currentChats(currentUserId);
      isInitialized.current = true;
    }
  }, [userData]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value.toLowerCase());
    // Convert search term to lowercase for case-insensitive search
    setShowDropdown(event.target.value.length > 0); // Show dropdown only when there's a search term
  };

  // Filter users based on search term when search term changes or data updates
  useEffect(() => {
    const filtered = data.filter((user) =>
      user.username.toLowerCase().includes(searchTerm)
    );
    setFilteredUsers(filtered);
  }, [data, searchTerm]);

  const handleSelect = (event) => {
    const selectedOptions = Array.from(
      event.target.selectedOptions,
      (option) => ({
        id: data.find((user) => user.username === option.value)._id,
        name: option.value,
        avatar: data.find((user) => user.username === option.value).avatar,
      })
    );

    const uniqueSelectedUsers = selectedOptions.filter(
      (newUser) => !selectedUsers.some((user) => user.id === newUser.id)
    );

    setShowDropdown(false);
    setSearchTerm("");
    setSelectedUsers([...uniqueSelectedUsers, ...selectedUsers]); // Update with a flat array of objects
  };

  const createChat = async (senderId, receiverId) => {
    try {
      console.log("senderId: ", senderId, "recieverId: ", receiverId);
      const response = await axios.post(
        "http://localhost:5000/api/v1/chat/create-chat",
        {
          senderId,
          receiverId,
        }
      );
      // console.log("Chat created:", response.data);
    } catch (error) {
      console.error("Error creating chat:", error);
    }
  };

  // TODO: FIND CURRENT-USER AND RECEIVER AND PASS IT
  useEffect(() => {
    // Call createChat function whenever selectedUsers changes
    if (selectedUsers.length > 0) {
      const senderId = userData.data._id;
      const lastSelectedUser = selectedUsers[0];
      // console.log("Last SelectedUser: ", lastSelectedUser);
      const receiverUser = data.find(
        (user) => user.username === lastSelectedUser.name
      );
      // console.log("recievedUser: ", receiverUser);
      const receiverId = receiverUser ? receiverUser._id : null; // Get the ID of the last selected user
      if (receiverId) {
        createChat(senderId, receiverId);
      }
    }
  }, [selectedUsers, data, userData]);

  // console.log(selectedUsers);
  // console.log("selected Users: ", selectedUsers);
  const onSubmit = (data) => {
    if (data.searchOption) {
      // console.log(data);
      data.searchOption.forEach((selectedTerm) => {
        setSearchTerm(selectedTerm);
      });
    } // This will log the selected option value (if applicable)
  };

  return (
    <div className="search-box">
      <input
        className="search-input"
        type="text"
        placeholder="Search Users..."
        value={searchTerm}
        onChange={handleSearch}
      />

      <form onSubmit={handleSubmit(onSubmit)}>
        {showDropdown && (
          <select
            multiple
            size={filteredUsers.length}
            className="search-dropdown"
            {...register("searchOption", { required: true })}
            onChange={handleSelect}
          >
            {/* Populate options based on filtered users */}
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <option key={user._id} value={user.username}>
                  {user.username}
                </option>
              ))
            ) : (
              <option value="">No users found</option>
            )}
          </select>
        )}
      </form>

      <div className="selected-users">
        {selectedUsers.length > 0 && (
          <div>
            {selectedUsers.map((user) => (
              <div key={user.id} className="user-info">
                <img
                  key={user.name}
                  className="avatar"
                  src={user.avatar}
                  alt={user.name + " profile pic"}
                />

                <p className="user-name" key={user.name}>
                  {user.name}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchBox;
