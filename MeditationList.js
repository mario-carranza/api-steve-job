import React, { useEffect } from 'react';
import {Text, View, ScrollView, Image} from 'react-native';
import styles from './styles/MeditationListStyles';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faChevronLeft, faChevronDown} from '@fortawesome/free-solid-svg-icons';
import MeditationThumb from '../../components/MeditationThumb';
import Touch from '../../components/Touch';
import Dropmenu from '../../components/Dropmenu';
import Api from '../../config/Api';
import Model from '../../hooks/Model';
import {Store} from '../../hooks/main_store';
import { SearchCategoriesTab } from '../../components/Search.CategoriesTab';
import { subCategories } from '../../containers/keys/subCategories';
import { httpsVerify } from '../../utils';

const MeditationList = ({navigation}) => {
  const {state} = React.useContext(Store);
  const minutesFilter = React.useRef(null);
  const [showDrop, setShowDrop] = React.useState({show: false});
  const [selectedFilter, setSelectedFilter] = React.useState(0);
  const [categories, setCategories] = React.useState([]);
  const [meditations, setMeditations] = React.useState(
    state?.meditations || [],
  );
  const [quicks, setQuicks] = React.useState([]);
  const [groups, setGroups] = React.useState([]);
  const [contGroups, setContGroups] = React.useState({});
  const [meditationsForMe, setMeditationsForMe] = React.useState(
    state?.meditationsForYou || [],
  );

  const [minutesFiltered, setMinutesFiltered] = React.useState('0');
  const [allMeditations, setAllMeditations] = React.useState([]);
  const [allSleeps, setAllSleeps] = React.useState([]);
  const [selectedCategory, setSelectedCategory] = React.useState(0);

  const [meditationsFiltered, setMeditationsFiltered] = React.useState([]);


  const renderThumbnail = (dataRender = []) => {
    let arrToReturn = [];
    const filter = dataRender?.filter((meditation) => meditation?.minutes === minutesFiltered)
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
        color="black"
      />
    ));
  };



  const renderQuick = () => {
    return quicks.map(({meditation}, index) => (
      <Touch
        key={'item-quick-' + index}
        style={styles.containerQuick}
        onPress={() =>
          navigation.navigate('PreviewMeditation', {item: meditation, kind: 'meditation'})
        }>
        <Image
          style={styles.imageQuick}
          source={{uri: httpsVerify(meditation?.thumb)}}
        />
        <Text style={styles.labelQuick}>{meditation?.name}</Text>
        <Text style={styles.sublabelQuick}>
          {meditation?.minutes || 0} min listen
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
      // 'Performance',
      // 'Focus',
      // 'Sleep',
      // 'Work',
      // 'Selfcare',
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
            color="black"
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
    getMeditations(minutes);
  };

  const onCategory = async category => {
    try {
      setGroups([]);
      if (category?.id) {
        const responseCategory = await Api.getDataBody(
          `/meditation-categories/${category?.id}`,
        );
        if (responseCategory.ok && responseCategory?.data?.groups?.length > 0) {
          setGroups(responseCategory?.data?.groups || []);
          responseCategory?.data?.groups?.forEach(group => {
            Api.getDataBody(`/meditation-groups/${group.id}`)
              .then(response => {
                if (response.ok && response?.data?.meditations) {
                  setContGroups(ov => ({
                    ...ov,
                    [group?.id]: response.data.meditations,
                  }));
                }
              })
              .catch(() => {});
          });
        }
      } else {
        getMeditations();
      }
    } catch (e) {
      // console.log(e);
    }
  };

  const getQuick = () =>
    new Promise(async resolve => {
      try {
        const responseItems = await Api.getDataBody(`quickaccess/meditation?lang=es`);
       
        //console.log('response items ',  responseItems.data.meditations[0])
        if (responseItems.ok) {
          setQuicks(responseItems?.data?.meditations);
        }
      } catch (e) {
        // console.log(e);
      } finally {
        resolve();
      }
    });

  const getMeditations = minutes =>
    new Promise(async resolve => {
      try {
        const responseMeditations = await Api.getDataBody(
          `/meditations?limit=6${minutes ? '&minutes=' + minutes : ''}`,
        );
        if (responseMeditations.ok) {
          setMeditations(
            (responseMeditations.data.meditations || [])
              .map(value => ({value, sort: Math.random()}))
              .sort((a, b) => a.sort - b.sort)
              .map(({value}) => ({...value, kind: 'meditation'})),
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
        const responseCategories = await Api.getDataBody(
          '/meditation-categories',
        );
        if (responseCategories.ok) {
          const newCategories = responseCategories?.data?.categories || [];
          setCategories(newCategories);
        }
      } catch (e) {
        //   console.log(e);
      } finally {
        // Model.setStore('loading', false);
        resolve();
      }
    });

  const getMeditationsForMe = async ({reasons, level}) => {
    try {
      const responseMeditations = await Api.getDataBody(
        `/meditations?limit=6${level ? `&levels=${level.id}` : ''}${
          reasons?.length > 0
            ? `&reasons=${reasons.map(reason => reason?.id)}`
            : ''
        }`,
      );
      if (responseMeditations.ok) {
        const resultData = (responseMeditations.data.meditations || [])
          .map(value => ({value, sort: Math.random()}))
          .sort((a, b) => a.sort - b.sort)
          .map(({value}) => ({...value, kind: 'meditation'}));
        Model.setStore('meditationsForYou', resultData);
        setMeditationsForMe(resultData);
      }
    } catch (e) {
      // console.log(e);
    }
  };

  const firstLoad = async () => {
    try {
      Model.setStore('loading', true);
      await getCategories();
      await getMeditations();
      await getQuick();
      await getMeditationsForMe(state?.user?.profile || {});
    } catch (e) {
      //   console.log(e);
    } finally {
      Model.setStore('loading', false);
    }
  };



  React.useEffect(() => {
    firstLoad();
    getAllMeditations()
  }, []);


  //******* meditations by filter */
  const getAllMeditations = async minutes => {
    try {
      const responseMeditations = await Api.getDataBody(
        `/meditations`,
        );
      
        
        responseMeditations.ok && setAllMeditations([ ...responseMeditations.data?.meditations])
        
        //console.log('reponse', responseMeditations.data.meditations[].categories[0].name);
      } catch (e) {
      }
    };
    

  const filterByCategory = (categorieIndex) => {
    let categoryName = ''

    switch (categorieIndex) {
      case 2:
        categoryName = subCategories.estres
        break;

      case 3:
        categoryName = subCategories.enfoque
        break;

      case 4:
        categoryName = subCategories.felicidad
        break;

      case 5:
        categoryName = subCategories.motivacion
        break;

      case 6:
        categoryName = subCategories.ansiedad
        break;

      case 7:
        categoryName = subCategories.relajacion
        break;

      case 8:
        categoryName = subCategories.concentracion
        break;
      case 9:
        categoryName = subCategories.energia
        break;
      default:
        break;
    }

    const filtered = allMeditations?.filter((meditation) =>{
      return meditation?.categories[0].name === categoryName && meditation
    } )

    setMeditationsFiltered(filtered)
   
    
  }

  useEffect(() => {
    filterByCategory(selectedFilter)
    console.log(selectedFilter)
  }, [selectedFilter]);
  //**************** */

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.rowHeader}>
          <Touch style={styles.backButton} onPress={() => navigation.goBack()}>
            <FontAwesomeIcon icon={faChevronLeft} />
          </Touch>
          <Text style={styles.title}>Meditation</Text>
        </View>
        <ScrollView
          style={styles.rowHeaderFilter}
          horizontal
          showsHorizontalScrollIndicator={false}>
          {renderFilters()}
        </ScrollView>
      </View>


{/*---------RENDER MEDITATIONS*/}
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}>
        {selectedFilter === 0 ? (
          <>
            {/* <Text style={styles.label}>Learning to meditate</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.rowItemsMusic}>{renderThumbnail()}</View>
        </ScrollView> */}

            {meditationsForMe?.length > 0 ? (
              <>
                <Text style={styles.label}>For you</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.horizontalScrollContainer}>
                  <View style={styles.rowItemsMusic}>
                    {renderThumbnail(meditationsForMe)}
                  </View>
                </ScrollView>
              </>
            ) : null}

            <Text style={styles.label}>Most Popular</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.horizontalScrollContainer}>
              <View style={styles.rowItemsMusic}>
                {renderThumbnail(meditations)}
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

            {/* <Text style={styles.label}>Reduce stress</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.rowItemsMusic}>{renderThumbnail()}</View>
        </ScrollView> */}

            {/* <Text style={styles.label}>Be positive</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.rowItemsMusic}>{renderThumbnail()}</View>
        </ScrollView> */}
          </>
        ) : (
          renderGroups()
        )}

        {/*ESTRES*/}
        {/*
          selectedFilter === 2 && (
            <SearchCategoriesTab meditations={meditationsFiltered} />
            
          )
          /*
        }

        {/*ENFOQUE*/}
        {/*
          selectedFilter === 3 && (
            <SearchCategoriesTab meditations={meditationsFiltered} />

          )
          */
        }

        {/*FELICIDAD*/}
        {/*
          selectedFilter === 4 && (
            <SearchCategoriesTab meditations={meditationsFiltered} />

          )
          */
        }

        {/*MOTIVACION*/}
        {/*
          selectedFilter === 5 && (
            <SearchCategoriesTab meditations={meditationsFiltered} />

          )
          */
        }

        {/*ANSIEDAD*/}
        {/*
          selectedFilter === 6 && (
            <SearchCategoriesTab meditations={meditationsFiltered} />
          )
          */
        }

        {/*RELAJACION*/}
        {/*
          selectedFilter === 7 && (
            <SearchCategoriesTab meditations={meditationsFiltered} />
          )
          */
        }

        {/*CONCENTRACION*/}
        {/*
          selectedFilter === 8 && (
            <SearchCategoriesTab meditations={meditationsFiltered} />
          )
          */
        }

        {/*ENERGIA*/}
        {/*
          selectedFilter === 9 && (
            <SearchCategoriesTab meditations={meditationsFiltered} />
          )
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

export default MeditationList;
