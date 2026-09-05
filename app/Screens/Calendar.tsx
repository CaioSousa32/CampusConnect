import React, { useState, useEffect, useMemo, } from "react";
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Animated, TextInput, Image} from "react-native";
import BackButton from "@/components/BackButton";
import { RFValue } from "react-native-responsive-fontsize";
import { MaterialIcons } from '@expo/vector-icons';
import { fetchCalendar } from "@/src/services/calendar"; 


interface HolidayProps {
  month: string;
  day: string;
  name: string;
  type: string;
}

const CalendarScreen: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [animatedHeight] = useState(new Animated.Value(80));

  const toggleDescription = (day: string) => {
    if (selectedDay === day) {
      Animated.timing(animatedHeight, {
        toValue: 80,
        duration: 300,
        useNativeDriver: false,
      }).start(() => setSelectedDay(null));
    } else {
      setSelectedDay(day);

      Animated.timing(animatedHeight, {
        toValue: 150,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  };

  const [holidays, setHolidays] = useState<HolidayProps[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState<boolean>(false);
  const [calendarTitle, setCalendarTitle] = useState("Calendário");

  // carregar JSON remoto
  useEffect(() => {
    requestAnimationFrame(async () => {
      setLoading(true);

      const result = await fetchCalendar();

      if (result) {
        setHolidays(result.data);
        setCalendarTitle(result.title || "Calendário");
        setLastUpdate(result.lastUpdate);
        setFromCache(result.fromCache);
      }

      setLoading(false);
    });
  }, []);

  const holidayType = [
    { type: "Início/Fim do período", color: "#92C36B" },
    { type: "Aula normal", color: "#FFF" },
    { type: "Início/Fim da unidade", color: "#57753D" },
    { type: "CRADT", color: "#FFEF44" },
    { type: "Início/Fim do recesso", color: "#E798C5" },
    { type: "Feriados", color: "#E56B6B" },
    { type: "Eventos", color: "#9463FF" },
    { type: "Reuniões", color: "#EF7C52" },
  ];

  // Filtrar os feriados com base na pesquisa
  const filteredHolidays = useMemo(() => {
    return holidays.filter(
      (holiday) =>
        holiday.name.toLowerCase().includes(searchText.toLowerCase()) ||
        holiday.type.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [holidays, searchText]);

  const monthsWithHolidays = useMemo(() => {
    return filteredHolidays.reduce((acc: string[], holiday) => {
      if (!acc.includes(holiday.month)) acc.push(holiday.month);
      return acc;
    }, []);
  }, [filteredHolidays]);


  if (loading) {
  return (
    <SafeAreaView
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
      }}
    >
      <Image source={require('../../assets/images/Loading.gif')} style={{width: '40%', height: '20%'}} resizeMode="contain"/>

      <Text style={{ marginTop: 20, fontSize: 18, color: "#2A5224" }}>
        Carregando calendário...
      </Text>
    </SafeAreaView>
  );
}

  return (
    <SafeAreaView style={styles.container}>
      <BackButton />
      <Text style={styles.title}>{calendarTitle}</Text>
      <View style={styles.separator} />
      <Text style={styles.lastUpdate}>
        Última atualização:{" "}
        {lastUpdate
          ? new Date(lastUpdate).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
          : "–"}
      </Text>
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={24} color="#2A5224" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Faça uma busca entre as datas"
          placeholderTextColor="#888"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.monthsContainer}>
          {monthsWithHolidays.map((month, index) => (
            <View key={index} style={styles.monthContainer}>
              <View style={styles.monthBox}>
                <Text style={styles.monthText}>{month}</Text>
              </View>

              <View style={styles.dayContainer}>
                {filteredHolidays
                  .filter((holiday) => holiday.month === month)
                  .map((holiday, i) => {
                    const isSelected = selectedDay === holiday.day;
                    return (
                      <Animated.View
                        key={i}
                        style={[
                          styles.dayBox,
                          {
                            backgroundColor: holidayType.find(
                              (t) => t.type === holiday.type
                            )?.color,
                            height: isSelected ? animatedHeight : 80,
                          },
                        ]}
                      >
                        <TouchableOpacity
                          style={styles.touchable}
                          onPress={() => toggleDescription(holiday.day)}
                        >
                          <View style={styles.dayContent}>
                            <Text style={styles.dayText}>{holiday.day}</Text>
                            <Text style={styles.dayTypeText}>{holiday.type}</Text>
                          </View>
                          {isSelected && (
                            <Text style={styles.descriptionText}>
                              {holiday.name}
                            </Text>
                          )}
                        </TouchableOpacity>
                      </Animated.View>
                    );
                  })}
              </View>
            </View>
          ))}
        </View>

        <View style={styles.separator2} />
        <View style={styles.holidayTypeContainer}>
          {holidayType.map((item, index) => (
            <View key={index} style={styles.typeHolidayBox}>
              <View
                style={[styles.typeColorBox, { backgroundColor: item.color }]}
              />
              <Text style={styles.typeText}>{item.type}</Text>
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: "4%",
    paddingTop: "6%",
  },
  title: {
    fontSize: RFValue(20),
    fontWeight: "bold",
    textAlign: "center",
    color: "#000",
    marginBottom: 10,
    marginTop: "10%",
  },
  separator: {
    width: "100%",
    height: 2,
    backgroundColor: "#000",
    marginBottom: 5,
  },
  lastUpdate: {
    fontSize: RFValue(12),
    color: "#888",
    textAlign: "right",
    marginBottom: 15,
  },
  scrollContainer: {
    paddingHorizontal: 20,
  },
  monthsContainer: {
    flexDirection: "column",
  },
  monthContainer: {
    marginBottom: 2,
  },
  monthBox: {
    backgroundColor: "#1B5E20",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: "center",
    justifyContent: "center",
    width: "60%",
    alignSelf: "flex-end",
    borderWidth: 1,
    borderColor: "#000",
  },
  monthText: {
    fontSize: RFValue(20),
    fontWeight: "bold",
    color: "#fff",
  },
  dayContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  dayBox: {
    borderRadius: 8,
    marginBottom: 10,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#000",
  },
  touchable: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
  },
  dayContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    width: "100%",
    marginLeft: "10%",
  },
  dayText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "black",
    marginRight: 10,
    textAlign: "left",
  },
  dayTypeText: {
    fontSize: 18,
    color: "black",
    textAlign: "left",
  },
  descriptionText: {
    fontSize: 14,
    color: "black",
    textAlign: "center",
    marginTop: 10,
    fontWeight: "bold",
    width: "96%"
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DEFCC7',
    borderRadius: 25,
    paddingHorizontal: 15,
    marginBottom: 25,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
  },
  searchIcon: {
    marginRight: 10,
    color: '#2A5224',
  },
  separator2: {
    width: "120%",
    height: 2,
    backgroundColor: "#000",
    marginBottom: 5,
    alignSelf: 'center'
  },
  holidayTypeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    marginTop: 30,
    paddingHorizontal: 15,
  },
  typeHolidayBox: {
    flexDirection: "row",
    alignItems: "center",
    width: "25%",
    marginBottom: 15,
    marginRight: "25%",
  },

  typeColorBox: {
    width: 20,
    height: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 4,
  },

  typeText: {
    fontSize: RFValue(10),
    color: "#000",
    textAlign: "left",
  },
});

export default CalendarScreen;
