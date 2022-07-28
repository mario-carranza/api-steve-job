import React, { useEffect } from 'react';
import {Text, View, ScrollView, Image} from 'react-native';
import styles from './styles/SleepListStyles';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faChevronLeft, faChevronDown} from '@fortawesome/free-solid-svg-icons';
import Touch from '../../components/Touch';
import Dropmenu from '../../components/Dropmenu';
import MeditationThumb from '../../components/MeditationThumb';
import Api from '../../config/Api';
import Model from '../../hooks/Model';
import {httpsVerify} from '../../utils';
import {Store} from '../../hooks/main_store';
import { SearchCategoriesTab } from '../../components/Search.CategoriesTab';

const SleepList = ({navigation}) => {
  const {state} = React.useContext(Store);
  const minutesFilter = React.useRef(null);
  const [showDrop, setShowDrop] = React.useState({show: false});
  const [selectedFilter, setSelectedFilter] = React.useState(0);
  const [categories, setCategories] = React.useState([]);
  const [sleeps, setSleeps] = React.useState(state?.sleeps || []);
  const [quicks, setQuicks] = React.useState([]);
  const [groups, setGroups] = React.useState([]);
  const [contGroups, setContGroups] = React.useState({});
  const [sleepsForMe, setSleepsForMe] = React.useState(
    state?.sleepsForYou || [],
  );

  

  const [minutesFiltered, setMinutesFiltered] = React.useState('0');
  const [allSleeps, setAllSleeps] = React.useState([]);
  const [sleepsFiltered, setSleepsFiltered] = React.useState([]);
  const [categoriesTabs, setCategoriesTabs] = React.useState([]);




 

  const renderThumbnail = (dataRender = []) => {

    //console.log('ddata',dataRender[0].categories[0].name)
    let arrToReturn = [];
    const filter = dataRender?.filter((sleep) => sleep?.minutes === minutesFiltered)
    if (minutesFiltered === '0') {
      arrToReturn = [...dataRender];
      
    }else {
      arrToReturn = [...filter];
    }
    
    return arrToReturn.map((item, index) => (
      <MeditationThumb
        key={'item-meditation-' + index}
        image={item.thumb}
        label={item.name}
        sublabel={(item?.minutes || 0) + ' min'}
        onPress={() =>
          item.id
            ? navigation.navigate('PreviewMeditation', {item, kind: item.kind})
            : null
        }
      />
    ));
  };

  const renderThumbnailByTab = (dataRender = []) => {

    
    return dataRender.map((item, index) => (
      <MeditationThumb
        key={'item-meditation-' + index}
        image={item.thumb}
        label={item.name}
        sublabel={(item?.minutes || 0) + ' min'}
        onPress={() =>
          item.id
            ? navigation.navigate('PreviewMeditation', {item, kind: item.kind})
            : null
        }
      />
    ));
  };

  const renderQuick = () => {
    return quicks.map(({sleep}, index) => (
      <Touch
        key={'item-quick-' + index}
        style={styles.containerQuick}
        onPress={() =>
          navigation.navigate('PreviewMeditation', {item: sleep, kind: 'sleep'})
        }>
        <Image
          style={styles.imageQuick}
          source={{uri: httpsVerify(sleep.thumb)}}
        />
        <Text style={styles.labelQuick}>{sleep.name}</Text>
        <Text style={styles.sublabelQuick}>
          {sleep.minutes || 0} min listen
        </Text>
      </Touch>
    ));
  };

  const toogleDrop = () => {
    if (minutesFilter?.current?.measure) {
      minutesFilter.current.measure((fx, fy, width, height, px, py) => {
        setShowDrop(ov => ({
          show: !ov.show,
          refX: px,
          refY: py,
        }));
      });
    }
  };

  const renderFilters = () => {
    const data = [
      {name: 'Recommended'},
      {name: 'Minutes'},
      // 'Sleep weel',
      // 'Deep sleep',
      // 'Good rest',
      // 'Dreaming',
    ];
    return [...data, ...categories].map((item, index) => (
      <Touch
        refs={item.name === 'Minutes' ? minutesFilter : null}
        key={'item-filter-' + index}
        style={
          item.name === 'Minutes' ? styles.buttonDrop : styles.buttonFilter
        }
        onPress={() => {
          if (item.name === 'Minutes') {
            toogleDrop();
          } else {
            onCategory(item);
            setSelectedFilter(index);
          }
        }}>
        <Text
          style={[
            styles.labelFilter,
            selectedFilter === index ? styles.purpleTxt : {},
          ]}>
          {item.name}
        </Text>
        {item.name === 'Minutes' ? (
          <FontAwesomeIcon
            icon={faChevronDown}
            color="white"
            size={12}
            style={{marginLeft: 6}}
          />
        ) : null}
      </Touch>
    ));
  };

  const renderGroups = () => {
    return groups.map((group, index) => (
      <>
        <Text style={styles.label} key={'item-label-group-' + index}>
          {group.name}
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.horizontalScrollContainer}
          key={'scroll-group-' + index}>
          <View style={styles.rowItemsMusic}>
            {renderThumbnail(contGroups[group.id])}
          </View>
        </ScrollView>
      </>
    ));
  };

  const filterByMinutes = minutes => {
    setSelectedFilter(0);
    setMinutesFiltered(minutes.toString());
    getSleeps(minutes);
  };

  const onCategory = async category => {
    try {
      setGroups([]);
      if (category?.id) {
        const responseCategory = await Api.getDataBody(
          `/sleep-categories/${category?.id}`,
        );
        if (responseCategory.ok && responseCategory?.data?.groups?.length > 0) {
          setGroups(responseCategory?.data?.groups || []);
          responseCategory?.data?.groups?.forEach(group => {
            Api.getDataBody(`/sleep-groups/${group.id}`)
              .then(response => {
                if (response.ok && response?.data?.sleeps) {
                  setContGroups(ov => ({
                    ...ov,
                    [group?.id]: response.data.sleeps,
                  }));
                }
              })
              .catch(() => {});
          });
        }
      } else {
        getSleeps();
      }
    } catch (e) {
      // console.log(e);
    }
  };

  const getQuick = () =>
    new Promise(async resolve => {
      try {
        const responseItems = await Api.getDataBody(`quickaccess/sleep?lang=es`);
        setQuicks([]);
        if (responseItems.ok) {
          setQuicks(responseItems.data.sleeps || []);
        }
      } catch (e) {
        // console.log(e);
      } finally {
        resolve();
      }
    });

  const getSleeps = minutes =>
    new Promise(async resolve => {
      try {
        const responseSleeps = await Api.getDataBody(
          `/sleeps?limit=6${minutes ? '&minutes=' + minutes : ''}`,
        );
        if (responseSleeps.ok) {
          setSleeps(
            (responseSleeps.data.sleeps || [])
              .map(value => ({value, sort: Math.random()}))
              .sort((a, b) => a.sort - b.sort)
              .map(({value}) => ({...value, kind: 'sleep'})),
          );
        }
      } catch (e) {
        // console.log(e);
      } finally {
        resolve();
      }
    });

  const getCategories = () =>
    new Promise(async resolve => {
      try {
        // Model.setStore('loading', true);
        const responseCategories = await Api.getDataBody('/sleep-categories');
        if (responseCategories.ok) {
          const newCategories = responseCategories?.data?.categories || [];
          setCategories(newCategories);
        }
      } catch (e) {
        //   console.log(e);
      } finally {
        resolve();
        // Model.setStore('loading', false);
      }
    });

  const getSleepsForMe = async ({reasons, level}) => {
    try {
      const responseSleeps = await Api.getDataBody(
        `/sleeps?limit=6${level ? `&levels=${level.id}` : ''}${
          reasons?.length > 0
            ? `&reasons=${reasons.map(reason => reason?.id)}`
            : ''
        }`,
      );
      if (responseSleeps.ok) {
        const resultData = (responseSleeps.data.sleeps || [])
          .map(value => ({value, sort: Math.random()}))
          .sort((a, b) => a.sort - b.sort)
          .map(({value}) => ({...value, kind: 'sleep'}));
        Model.setStore('sleepsForYou', resultData);
        setSleepsForMe(resultData);
      }
    } catch (e) {
      // console.log(e);
    }
  };

  const firstLoad = async () => {
    try {
      Model.setStore('loading', true);
      await getCategories();
      await getSleeps();
      await getQuick();
      await getSleepsForMe(state?.user?.profile || {});
    } catch (e) {
      //   console.log(e);
    } finally {
      Model.setStore('loading', false);
    }
  };

  React.useEffect(() => {
    firstLoad();
    getAllSleeps()
    
  }, []);

  

  // FILTER BY SLEEP CATEGORY NAME

  const getAllSleeps = async () =>{
    let myCategories= []
    try {
      const responseSleeps = await Api.getDataBody(
        `/sleeps`,
      );
      if (responseSleeps.ok) {
        setAllSleeps(responseSleeps?.data?.sleeps);

      }

      // setting dinamic tabs,because we don't know how many categories there are
    for (let i = 0; i < categories.length; i++) {
      myCategories.push(
        {
          name: categories[i]?.name,
          index: i += 2,
          sleeps: allSleeps.filter(sleep => sleep?.categories[0]?.name  === categories[i]?.name)
        })
    }
    setCategoriesTabs([...myCategories])

    } catch (e) {
      // console.log(e);
    }
  }
 

  // filter content tab by categorie name and tab index
  const filterByCategoryName = (categoryIndex) => {

    if (categoryIndex > 1) {
      const sleepsFilteredByCategoryName = categoriesTabs.find(category => category.index === categoryIndex )
      setSleepsFiltered(sleepsFilteredByCategoryName?.sleeps)
     
    }
    
  }

  useEffect(() => {
    filterByCategoryName(selectedFilter)
  }, [selectedFilter]);

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/lists/bgSleep.png')}
        style={styles.backgroundImage}
      />
      <View style={styles.header}>
        <View style={styles.rowHeader}>
          <Touch style={styles.backButton} onPress={() => navigation.goBack()}>
            <FontAwesomeIcon icon={faChevronLeft} color="white" />
          </Touch>
          <Text style={styles.title}>Sleep</Text>
        </View>
        <ScrollView
          style={styles.rowHeaderFilter}
          horizontal
          showsHorizontalScrollIndicator={false}>
          {renderFilters()}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}>
        {selectedFilter === 0 ? (
          <>
            {/* <Text style={styles.label}>Learning to meditate</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.rowItemsMusic}>{renderThumbnail()}</View>
        </ScrollView> */}

            {sleepsForMe?.length > 0 ? (
              <>
                <Text style={styles.label}>For you</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.horizontalScrollContainer}>
                  <View style={styles.rowItemsMusic}>
                    {renderThumbnail(sleepsForMe)}
                  </View>
                </ScrollView>
              </>
            ) : null}

            <Text style={styles.label}>Most Popular exercises</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.horizontalScrollContainer}>
              <View style={styles.rowItemsMusic}>
                {renderThumbnail(sleeps)}
              </View>
            </ScrollView>

            {quicks.length > 0 ? (
              <>
                <Text style={styles.label}>Quick access</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.horizontalScrollContainer}>
                  <View style={styles.rowItemsMusic}>{renderQuick()}</View>
                </ScrollView>
              </>
            ) : null}

            {/* <Text style={styles.label}>Sound {'&'} Music</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.rowItemsMusic}>{renderThumbnail()}</View>
        </ScrollView> */}

            {/* <Text style={styles.label}>Rest weel</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.rowItemsMusic}>{renderThumbnail()}</View>
        </ScrollView> */}
          </>
        ) : (
          renderGroups()
        )}

{/* *******************RENDER DINAMIC TABS*/}
        {/*
          categoriesTabs.map((category) => {
            return selectedFilter === category.index &&
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.horizontalScrollContainer}>
                <View style={styles.rowItemsMusic}>
                  {renderThumbnailByTab(sleepsFiltered)}
                </View>
              </ScrollView> 
          })
          */
          
        }


        <View style={styles.blank} />
      </ScrollView>
      <Dropmenu
        open={showDrop.show}
        onClose={() => setShowDrop({show: false})}
        coords={{x: showDrop.refX, y: showDrop.refY}}
        onPress={filterByMinutes}
      />
    </View>
  );
};

export default SleepList;
