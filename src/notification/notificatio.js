import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  ListItemButton,
  useTheme,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  TextField,
  Alert,
} from '@mui/material';
import app from '../firebase/config';
import { child, get, getDatabase, ref, set, update } from "firebase/database";
import { tokens } from "../theme";
import Favorite from '@mui/icons-material/Favorite';
import Header from '../components/Header';
import ShowAlert from '../components/ShowAlert';
import currentDate from '../utils/date';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';

const db = getDatabase(app);

const Notifications = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [openSelectDilog, setSelectDilog] = useState(false);
  const [select, setSelect] = useState(1);

  const [openAllNotificationDilogBox, setOpenAllNotificationDilogBox] = useState(false)
  const [openSendNotificationDilogBox, setOpenSendNotificationDilogBox] = useState(false)
  const [openRecevedNotificationDilogBox, setOpenRecevedNotificationDilogBox] = useState(false)
  const [userData, setUserData] = useState([]);
  // console.log(userData)
  const [openAlert, setOpenAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState("");
  const [notificationNameTitle, SetNotificationNameTitle] = useState("")
  const [notificationNameSublect, SetNotificationNameSublect] = useState("")
  const [notificationNameMessage, SetNotificationNameMessage] = useState("")
  const [userUid, setUserUid] = useState("")
  const [receveNotificationData, setReceveNotificationData] = useState([])
  const [allAndSendNotificationData, setallAndSendNotificationData] = useState([])
  // console.log("allAndSendNotificationData", "   : ", allAndSendNotificationData)
  // console.log("receveNotificationData", "   : ", receveNotificationData)



  const openNotifications = () => {
    if (select === 1) {
      setOpenAllNotificationDilogBox(true)
    }
    if (select === 2) {
      setOpenSendNotificationDilogBox(true)
    }
    if (select === 3) {
      setOpenRecevedNotificationDilogBox(true)
    }
  }
  //read all user data
  useEffect(() => {
    const dbRef = ref(db);
    get(child(dbRef, `User/`))
      .then((snapshot) => {
        const data = snapshot.val();
        setUserData([])
        if (snapshot.exists()) {
          Object.values(data).map((users) => {
            return setUserData((oldusers) => [...oldusers, users])
          })
        }
      })
      .catch((error) => {
        console.log("data is not avilable", error.message);
      });
  }, [userData]);

  //handdle Open Select DilogBox
  const handdleOpenSelectDilogBox = (uid, seq) => {
    setSelectDilog(true);
    setUserUid(uid);

  }
  //handdle Open Select DilogBox
  const handdlColseSelectDilogBox = () => {
    setSelectDilog(false)
  }

  // select your choice 
  const handdleAdminSelection = (e) => {
    setSelect(e.target.value);


  }

  //Close service request dilog box 
  const handdleCloseReqServiceDilog = () => {
    setOpenAllNotificationDilogBox(false)
  }

  // add fav client
  const addFavClient = (uid, seen, id) => {
    const dbRef = ref(db);
    if (seen === false) {
      update(child(dbRef, `User/${uid}`), {
        seen: true
      }).then(() => {
        // alert("User added in Favorite List")
        setOpenAlert(true)
        setAlertMessage("User added in Favorite List")

      }).catch(err => alert(err.message))
    } else {
      update(child(dbRef, `User/${uid}`), {
        seen: false
      }).then(() => {
        setOpenAlert(true)
        setAlertMessage("User removed from Favorite List")

      }).catch(err => alert(err.message))
    }
  }


  // send notification
  const handdleSendNotification = (e) => {
    e.preventDefault();
    console.log(`Notification Sanded title is ${notificationNameTitle}, subject is ${notificationNameSublect}, message is ${notificationNameMessage}`)
    const uid = new Date().getTime();

    set(ref(db, `Enq/${userUid}/${uid}`), {
      uid: `${userUid}`,
      id: `${uid}`,
      num: "1111111",
      eml: "loan@gmail.com",
      titl: notificationNameTitle,
      sub: notificationNameSublect,
      desc: notificationNameMessage,
      date: `${currentDate}`,
      seen: false,
      who: true,
      del: false,

    }
    ).then(() => {
      console.log("Sand")
      setOpenAlert(true)
      setAlertMessage("Notifiaction Sand SuccessFully ")
    }).catch(err => console.log(err.message))
  }

  // read notification
  useEffect(() => {
    const dbRef = ref(db);
    console.log("path is ", `Enq/${userUid}`)
    get(child(dbRef, `Enq/${userUid}`))
      .then((snapshot) => {
        const data = snapshot.val();
        setReceveNotificationData([]);
        setallAndSendNotificationData([])
        if (snapshot.exists()) {

          Object.values(data).map((notification) => {
            if (notification.who === true) {
              return setallAndSendNotificationData((oldSendNotification) => [...oldSendNotification, notification])
            }

            return setReceveNotificationData((oldReceveNotification) => [...oldReceveNotification, notification])
          })
          // setuserUid(data)
        } else {
          console.log("No data available");
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }, [userUid]);



  // 
  const columns = [

    {
      field: "titl",
      headerName: "Tittle",
      flex: 1,
      cellClassName: "name-column--cell",
    },

    {
      field: "sub",
      headerName: "Subject",
      flex: 1,
    },
    {
      field: "desc",
      headerName: "Description",
      flex: 1,

    },
    {
      field: "date",
      headerName: "Date",
      flex: 1,

    },
  ];

  return (
    <Box m="20px">
      <Header title="Notifications" subtitle="Menage Your All User Notification" />
      <ShowAlert
        sx={{ display: "none" }}
        message={alertMessage}
        show={openAlert}
        hide={() => { setOpenAlert(false) }}
      />
      {/* user list  */}
      {/*========================================== all user   =======================================================  */}
      <List  >
        <Grid container item xs={12}  >
          {userData.map((user, index) => {

            return (
              <Grid key={index} item xs={3} sx={{ width: '100%', borderColor: colors.primary[500], borderWidth: "2px", borderStyle: "solid", maxWidth: 400, background: colors.blueAccent[900] }} >
                <ListItem   >
                  <ListItemAvatar>
                    <Avatar alt={user.name} src={user.profile} onClick={() => { handdleOpenSelectDilogBox(user.uid, user.seq) }} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={user.name}
                    sx={{
                      "& 	.MuiListItemText-primary": {
                        color: colors.greenAccent[400],
                        fontSize: "18px"
                      }
                    }}
                    secondary={
                      <React.Fragment>
                        <Typography
                          sx={{ display: 'inline' }}
                          component="span"
                          variant="body2"
                          color={"text.primary"}
                        >
                          {user.lastseen}
                        </Typography>

                      </React.Fragment>
                    }
                  />
                  <ListItemButton edge="end" aria-label="like" >
                    {
                      user.seen ? <Favorite sx={{ color: colors.redAccent[600] }} onClick={() => addFavClient(user.uid, user.seen, user.seq)} /> : <Favorite sx={{ color: "white" }} onClick={() => addFavClient(user.uid, user.seen)} />
                    }

                  </ListItemButton>
                </ListItem>

              </Grid>
            )
          })}
        </Grid>
      </List>

      {/*==========================================================Dilog box : select Notification type ==================================================  */}
      <div>
        <Dialog
          open={openSelectDilog}
          onClose={handdlColseSelectDilogBox}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            {"Select Your Choice?"}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              <FormControl sx={{ margin: "12px 20px", minWidth: 150, color: colors.greenAccent[500], }}>
                <InputLabel id="demo-simple-select-autowidth-label " sx={{ color: colors.greenAccent[500] }} >Select your choice</InputLabel>
                <Select
                  labelId="demo-simple-select-autowidth-label"
                  id="demo-simple-select-autowidth"
                  value={select}
                  onChange={handdleAdminSelection}
                  autoWidth
                  label="Select your choice"
                >
                  <MenuItem value={1}>All Notifications </MenuItem>
                  <MenuItem value={2}>Send Notification</MenuItem>
                  <MenuItem value={3}>Receved Notification</MenuItem>
                </Select>
              </FormControl>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                if (select === 1) { setOpenAllNotificationDilogBox(true) }
                if (select === 2) { setOpenSendNotificationDilogBox(true) }
                if (select === 3) { setOpenRecevedNotificationDilogBox(true) }
              }}
              color="secondary"
              variant="outlined"
            > Open </Button>
            <Button onClick={handdlColseSelectDilogBox} color="secondary" variant="outlined" > Close </Button>
          </DialogActions>
        </Dialog>
      </div>


      {/*================================================== Dilog box : All Notification  ==================================================  */}
      <div >
        <Dialog
          open={openAllNotificationDilogBox}
          onClose={() => { setOpenAllNotificationDilogBox(false) }}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          fullScreen
        >
          <DialogTitle id="alert-dialog-title">
            {` All Notification`}
          </DialogTitle>
          <DialogContent>
            <Box
              width="95vw"
              height="85vh"
              sx={{
                "& .MuiDataGrid-root": {
                  border: "none",
                },
                "& .MuiDataGrid-cell": {
                  borderBottom: "none",
                },
                "& .name-column--cell": {
                  color: colors.greenAccent[300],
                },
                "& .MuiDataGrid-columnHeaders": {
                  backgroundColor: colors.blueAccent[700],
                  borderBottom: "none",
                },
                "& .MuiDataGrid-virtualScroller": {
                  backgroundColor: colors.primary[400],
                },
                "& .MuiDataGrid-footerContainer": {
                  borderTop: "none",
                  backgroundColor: colors.blueAccent[700],
                },
                "& .MuiCheckbox-root": {
                  color: `${colors.greenAccent[200]} !important`,
                },
              }}
            >
              {/* */}
              <DataGrid
                getRowId={(allAndSendNotificationData) => allAndSendNotificationData.id}
                checkboxSelection
                disableSelectionOnClick
                disableColumnSelector
                components={{ Toolbar: GridToolbar }}
                columns={columns}
                rows={allAndSendNotificationData}
              // onRowClick={handdleUpdateAppInstalledUser}
              />

            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handdleCloseReqServiceDilog} color="secondary" variant="outlined" > Close </Button>
          </DialogActions>
        </Dialog>
      </div>


      {/*================================================== Dilog box : Send Notification  ==================================================  */}
      <div>
        <Dialog
          open={openSendNotificationDilogBox}
          onClose={() => { setOpenSendNotificationDilogBox(false) }}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            {` Sended Notification 5`}
          </DialogTitle>
          <DialogContent>

            <Box m="20px" sx={{ display: "flex" }} >
              <form onSubmit={handdleSendNotification} style={{ display: "flex", flexDirection: "column" }} >
                <TextField
                  id="title"
                  label="Notification Title"
                  placeholder="Enter Your Notification Title"
                  multiline
                  variant="standard"
                  onChange={(e) => SetNotificationNameTitle(e.target.value)}
                  value={notificationNameTitle}
                  name="notificationNameTitle"
                  sx={{ width: "250px", marginTop: "5px" }}
                />
                <TextField
                  id="subject"
                  label="Notification Subject"
                  placeholder="Enter Your Notification Subject"
                  multiline
                  variant="standard"
                  onChange={(e) => SetNotificationNameSublect(e.target.value)}
                  value={notificationNameSublect}
                  name="notificationNameSublect"
                  sx={{ width: "250px", marginTop: "5px" }}
                />
                <TextField
                  id="message"
                  label="Notification Message"
                  placeholder="Enter Your Notification Message"
                  multiline
                  variant="standard"
                  onChange={(e) => SetNotificationNameMessage(e.target.value)}
                  value={notificationNameMessage}
                  name="notificationNameMessage"
                  sx={{ width: "250px", marginTop: "5px" }}
                />
                <Box display="flex" justifyContent="center" ml="20px" mt="20px" mb="10px">
                  <Button type="submit" color="secondary" variant="outlined">
                    Send Notification
                  </Button>

                </Box>
              </form>
            </Box>

            <DialogContentText id="alert-dialog-description">
              {allAndSendNotificationData.length === 0 ? <Typography variant='h4' >Yet! ,  Not any notification</Typography> :

                allAndSendNotificationData.map((allAndSendNotificaion) => {
                  return (
                    <Box sx={{ width: '100%', maxWidth: 500, borderBottom: "1px solid white" }}>

                      <Box display="flex" flex="1"  >
                        <Typography flex="0.30" variant="h4" color={colors.greenAccent[400]} gutterBottom  > Tittle  is  </Typography>
                        <Typography flex="0.70" variant='h5' color={colors.grey[400]} >  {allAndSendNotificaion.titl}   </Typography>
                      </Box>

                      <Box display="flex" flex="1"  >
                        <Typography flex="0.30" variant="h4" color={colors.greenAccent[400]} gutterBottom  > Subject is </Typography>
                        <Typography flex="0.70" variant="h5" gutterBottom >{allAndSendNotificaion.sub}</Typography>
                      </Box>


                      <Box display="flex" flex="1"  >
                        <Typography flex="0.30" variant="h4" color={colors.greenAccent[400]} gutterBottom>Description is </Typography>
                        <Typography flex="0.70" variant='h5'>{allAndSendNotificaion.desc}</Typography>
                      </Box>

                      <Box display="flex" flex="1"  >
                        <Typography flex="0.30" variant="h4" color={colors.greenAccent[400]} gutterBottom > Notifyed At </Typography>
                        <Typography flex="0.70" variant='h5' >  {allAndSendNotificaion.date} </Typography>
                      </Box>

                    </Box>
                  )
                })

              }
            </DialogContentText>

          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setOpenSendNotificationDilogBox(false) }} color="secondary" variant="outlined" > Close </Button>
          </DialogActions>
        </Dialog>
      </div>


      {/*================================================== Dilog box : Receved Notification  ==================================================  */}
      <div>
        <Dialog
          open={openRecevedNotificationDilogBox}
          onClose={() => { setOpenRecevedNotificationDilogBox(false) }}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            {` Receved Notifications 5`}
          </DialogTitle>
          <DialogContent>

            <DialogContentText id="alert-dialog-description">
              {receveNotificationData.map((receveNotificaion) => {
                return (
                  <Box sx={{ width: '100%', maxWidth: 500, borderBottom: "1px solid white" }}>

                    <Box display="flex" flex="1"  >
                      <Typography flex="0.30" variant="h4" color={colors.greenAccent[400]} gutterBottom  >Tittle  is </Typography>
                      <Typography flex="0.70" variant='h4' color={colors.grey[400]} >  {receveNotificaion.titl}   </Typography>
                    </Box>

                    <Box display="flex" flex="1"  >
                      <Typography flex="0.30" variant="h4" color={colors.greenAccent[400]} gutterBottom  >Subject is </Typography>
                      <Typography flex="0.70" variant="h5" gutterBottom >{receveNotificaion.sub}</Typography>
                    </Box>


                    <Box display="flex" flex="1"  >
                      <Typography flex="0.30" variant="h4" color={colors.greenAccent[400]} gutterBottom>Description is </Typography>
                      <Typography flex="0.70" typography="" variant='h4'>{receveNotificaion.desc}</Typography>
                    </Box>

                    <Box display="flex" flex="1"  >
                      <Typography flex="0.30" variant="h4" color={colors.greenAccent[400]} gutterBottom > Notifyed At </Typography>
                      <Typography flex="0.70" variant='h4' >  {receveNotificaion.date} </Typography>
                    </Box>

                  </Box>
                )
              })}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setOpenRecevedNotificationDilogBox(false) }} color="secondary" variant="outlined" > Close </Button>
          </DialogActions>
        </Dialog>
      </div>
    </Box>
  )
}

export default Notifications;