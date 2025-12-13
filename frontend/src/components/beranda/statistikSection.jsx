import React, { useState, useEffect, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { useQuery } from "@tanstack/react-query";

const StatistikSection = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [activeChart, setActiveChart] = useState("bar");
  const [lastUpdated, setLastUpdated] = useState("");
  const [lastAddedDate, setLastAddedDate] = useState(null);
  const [activeIndex, setActiveIndex] = useState(null);
  const [isHovering, setIsHovering] = useState(false);

  const fetchMembers = async () => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/api/db`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (!response.ok) {
      throw new Error("Gagal mengambil data anggota");
    }

    return await response.json();
  };

  const {
    data: members = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["members", "public"],
    queryFn: fetchMembers,
    staleTime: 30 * 60 * 1000,
    cacheTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const statistics = useMemo(() => {
    if (!members.length)
      return {
        angkatanData: [],
        jenjangData: [],
        totalAnggota: 0,
        totalJenjang: { muda: 0, madya: 0, bhakti: 0 },
        jenjangPieData: [],
        detailedAngkatanData: [],
        lastAddedMember: null,
      };

    const angkatanMap = new Map();
    const jenjangMap = new Map();
    const angkatanDetailsMap = new Map();
    let latestMember = null;
    let latestDate = null;

    for (let i = 0; i < members.length; i++) {
      const member = members[i];
      const year = member.angkatan;
      const jenjang = member.jenjang || "muda";

      angkatanMap.set(year, (angkatanMap.get(year) || 0) + 1);

      if (!jenjangMap.has(year)) {
        jenjangMap.set(year, {
          muda: 0,
          madya: 0,
          bhakti: 0,
          total: 0,
        });
      }

      const jenjangData = jenjangMap.get(year);
      jenjangData[jenjang] = (jenjangData[jenjang] || 0) + 1;
      jenjangData.total++;

      if (!angkatanDetailsMap.has(year)) {
        angkatanDetailsMap.set(year, {
          year: String(year),
          muda: 0,
          madya: 0,
          bhakti: 0,
          total: 0,
        });
      }

      const angkatanDetail = angkatanDetailsMap.get(year);
      angkatanDetail[jenjang] = (angkatanDetail[jenjang] || 0) + 1;
      angkatanDetail.total =
        angkatanDetail.muda + angkatanDetail.madya + angkatanDetail.bhakti;

      const memberDate =
        member.createdAt || member.updatedAt || member.timestamp;
      if (memberDate) {
        const date = new Date(memberDate);
        if (!latestDate || date > latestDate) {
          latestDate = date;
          latestMember = member;
        }
      }
    }

    const angkatanData = Array.from(angkatanMap, ([year, count]) => ({
      year: String(year),
      count,
    })).sort((a, b) => b.year - a.year);

    const detailedAngkatanData = Array.from(angkatanDetailsMap.values())
      .sort((a, b) => b.year - a.year)
      .slice(0, 8);

    const totalJenjang = {
      muda: members.filter((m) => (m.jenjang || "muda") === "muda").length,
      madya: members.filter((m) => m.jenjang === "madya").length,
      bhakti: members.filter((m) => m.jenjang === "bhakti").length,
    };

    const jenjangPieData = [
      {
        name: "Muda",
        value: totalJenjang.muda,
        color: "#10B981",
        hoverColor: "#0EA271",
        shadowColor: "rgba(16, 185, 129, 0.3)",
      },
      {
        name: "Madya",
        value: totalJenjang.madya,
        color: "#EF4444",
        hoverColor: "#DC2626",
        shadowColor: "rgba(239, 68, 68, 0.3)",
      },
      {
        name: "Bhakti",
        value: totalJenjang.bhakti,
        color: "#F59E0B",
        hoverColor: "#D97706",
        shadowColor: "rgba(245, 158, 11, 0.3)",
      },
    ];

    return {
      angkatanData,
      detailedAngkatanData,
      totalAnggota: members.length,
      totalJenjang,
      jenjangPieData,
      lastAddedMember: latestMember,
      lastAddedDate: latestDate,
    };
  }, [members]);

  useEffect(() => {
    if (statistics.lastAddedDate) {
      const date = new Date(statistics.lastAddedDate);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      const diffMinutes = Math.floor(diffTime / (1000 * 60));

      let updateText = "";

      if (diffDays > 0) {
        updateText = `${diffDays} hari yang lalu`;
      } else if (diffHours > 0) {
        updateText = `${diffHours} jam yang lalu`;
      } else if (diffMinutes > 0) {
        updateText = `${diffMinutes} menit yang lalu`;
      } else {
        updateText = "Baru saja";
      }

      const formattedDate = date.toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "Asia/Jakarta",
      });

      const formattedTime = date.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Jakarta",
      });

      setLastUpdated(`${updateText} (${formattedDate} ${formattedTime})`);
      setLastAddedDate(date);
    } else if (members.length > 0) {
      const now = new Date();
      const formattedDate = now.toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "Asia/Jakarta",
      });

      const formattedTime = now.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Jakarta",
      });

      setLastUpdated(`Data tersedia (${formattedDate} ${formattedTime})`);
    }
  }, [statistics.lastAddedDate, members.length]);

  const onPieEnter = (data, index) => {
    setActiveIndex(index);
    setIsHovering(true);
  };

  const onPieLeave = () => {
    setActiveIndex(null);
    setIsHovering(false);
  };

  const getPieSize = () => {
    if (isHovering && activeIndex !== null) {
      return {
        innerRadius: "30%",
        outerRadius: "75%",
        paddingAngle: 6,
      };
    }
    return {
      innerRadius: "25%",
      outerRadius: "70%",
      paddingAngle: 4,
    };
  };

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
    name,
    value,
  }) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius * 1.15;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const total = statistics.totalAnggota;
    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;

    const isActive = activeIndex === index;
    const data = statistics.jenjangPieData[index];

    return (
      <g>
        <text
          x={x}
          y={y}
          fill={isActive ? data.hoverColor : data.color}
          textAnchor={x > cx ? "start" : "end"}
          dominantBaseline="central"
          className="text-sm font-bold"
          style={{
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            opacity: isActive ? 1 : 0.9,
            transform: isActive ? "scale(1.05)" : "scale(1)",
            transformOrigin: "center",
          }}
        >
          {`${name}: ${value}`}
        </text>
        <text
          x={x}
          y={y + 14}
          fill={isActive ? data.hoverColor : data.color}
          textAnchor={x > cx ? "start" : "end"}
          dominantBaseline="central"
          className="text-[12px] font-medium"
          style={{
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            opacity: isActive ? 0.9 : 0.7,
          }}
        >
          {`(${percentage}%)`}
        </text>
      </g>
    );
  };

  const getCellColor = (data, index) => {
    return activeIndex === index ? data.hoverColor : data.color;
  };

  const PieChartTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const total = statistics.totalAnggota;
      const percentage =
        total > 0 ? ((data.value / total) * 100).toFixed(1) : 0;

      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg min-w-[150px]">
          <p className="font-bold text-gray-800 text-sm mb-3">{`${data.name}`}</p>

          <div className="space-y-2 mb-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 text-sm">Jumlah</span>
              <span className="font-bold text-sm">{data.value} orang</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700 text-sm">Persentase</span>
              <span className="font-bold text-sm">{percentage}%</span>
            </div>
          </div>

          <div className="border-t border-gray-300 pt-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-800 text-sm font-bold">Total</span>
              <div className="text-right">
                <div className="text-blue-600 text-lg font-bold">{total}</div>
                <div className="text-gray-500 text-xs">anggota</div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const BarChartTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum, entry) => sum + (entry.value || 0), 0);
      const muda = payload.find((p) => p.dataKey === "muda")?.value || 0;
      const madya = payload.find((p) => p.dataKey === "madya")?.value || 0;
      const bhakti = payload.find((p) => p.dataKey === "bhakti")?.value || 0;

      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg min-w-[150px]">
          <p className="font-bold text-gray-800 text-sm mb-3">{`Angkatan ${label}`}</p>

          <div className="space-y-2 mb-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                <span className="text-gray-700 text-sm">Muda</span>
              </div>
              <span className="font-bold text-sm">{muda}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                <span className="text-gray-700 text-sm">Madya</span>
              </div>
              <span className="font-bold text-sm">{madya}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                <span className="text-gray-700 text-sm">Bhakti</span>
              </div>
              <span className="font-bold text-sm">{bhakti}</span>
            </div>
          </div>

          <div className="border-t border-gray-300 pt-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-800 text-sm font-bold">Total</span>
              <div className="text-right">
                <div className="text-blue-600 text-lg font-bold">{total}</div>
                <div className="text-gray-500 text-xs">anggota</div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <section className="py-8 sm:py-12 md:py-16 px-4 sm:px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6 sm:mb-8 md:mb-10">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-3 sm:mb-4">
            Statistik Anggota Racana Diponegoro
          </h2>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-2 sm:px-0">
            Data statistik aktual berdasarkan database anggota terpusat
          </p>
          <div className="inline-flex items-center justify-center mt-3 sm:mt-4 px-3 sm:px-4 py-1 sm:py-2 bg-blue-50 rounded-full">
            <div className="flex items-center">
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-xs sm:text-sm text-blue-700">
                {lastUpdated || "Memuat data..."}
              </span>
            </div>
          </div>
          {lastAddedDate && (
            <p className="text-xs text-gray-500 mt-2">
              Berdasarkan penambahan anggota terakhir
            </p>
          )}
        </div>

        {/* Error Message */}
        {isError && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg mx-2 sm:mx-0">
            <p className="text-red-700 text-sm sm:text-base">
              {error?.message || "Terjadi kesalahan saat mengambil data"}
            </p>
            <p className="text-xs sm:text-sm text-red-600 mt-1">
              Silakan refresh halaman atau coba lagi nanti
            </p>
          </div>
        )}

        {/* Statistik Utama - Mobile Responsive */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8 md:mb-10">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl shadow-sm border border-blue-200">
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-900 mb-1 sm:mb-2">
              {isLoading ? "..." : statistics.totalAnggota}
            </div>
            <div className="text-gray-700 font-medium text-xs sm:text-sm md:text-base">
              Total Anggota
            </div>
            <div className="text-xs text-gray-500 mt-1 sm:mt-2">Terdaftar</div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl shadow-sm border border-green-200">
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-green-900 mb-1 sm:mb-2">
              {isLoading ? "..." : statistics.totalJenjang.muda}
            </div>
            <div className="text-gray-700 font-medium text-xs sm:text-sm md:text-base">
              Anggota Muda
            </div>
            <div className="text-xs text-gray-500 mt-1 sm:mt-2">
              Jenjang dasar
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl shadow-sm border border-red-200">
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-red-900 mb-1 sm:mb-2">
              {isLoading ? "..." : statistics.totalJenjang.madya}
            </div>
            <div className="text-gray-700 font-medium text-xs sm:text-sm md:text-base">
              Anggota Madya
            </div>
            <div className="text-xs text-gray-500 mt-1 sm:mt-2">
              Jenjang menengah
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl shadow-sm border border-yellow-200">
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-yellow-900 mb-1 sm:mb-2">
              {isLoading ? "..." : statistics.totalJenjang.bhakti}
            </div>
            <div className="text-gray-700 font-medium text-xs sm:text-sm md:text-base">
              Anggota Bhakti
            </div>
            <div className="text-xs text-gray-500 mt-1 sm:mt-2">
              Jenjang lanjutan
            </div>
          </div>
        </div>

        {/* Grafik - Mobile Optimized */}
        <div className="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
              Visualisasi Data
            </h3>
            <div className="flex space-x-2 w-full sm:w-auto">
              <button
                onClick={() => setActiveChart("bar")}
                className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg font-medium text-xs sm:text-sm transition-colors ${
                  activeChart === "bar"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                Per Angkatan
              </button>
              <button
                onClick={() => setActiveChart("pie")}
                className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg font-medium text-xs sm:text-sm transition-colors ${
                  activeChart === "pie"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                Per Jenjang
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="h-64 sm:h-72 md:h-80 lg:h-96 flex flex-col items-center justify-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3 sm:mb-4"></div>
              <div className="text-gray-500 text-sm sm:text-base">
                Memuat data statistik...
              </div>
            </div>
          ) : statistics.angkatanData.length > 0 ||
            statistics.jenjangPieData.length > 0 ? (
            <div className="h-64 sm:h-72 md:h-80 lg:h-96 relative">
              {activeChart === "bar" ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={statistics.detailedAngkatanData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#E5E7EB"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="year"
                      fontSize={12}
                      tick={{ fill: "#6B7280" }}
                      label={{
                        value: "Angkatan",
                        position: "insideBottom",
                        offset: -5,
                        fontSize: 11,
                      }}
                    />
                    <YAxis
                      fontSize={12}
                      tick={{ fill: "#6B7280" }}
                      label={{
                        value: "Jumlah Anggota",
                        angle: -90,
                        position: "insideLeft",
                        offset: 10,
                        fontSize: 11,
                      }}
                    />
                    <Tooltip content={<BarChartTooltip />} />
                    <Bar
                      dataKey="muda"
                      name="Muda"
                      fill="#10B981"
                      stackId="a"
                      radius={[4, 4, 0, 0]}
                      animationBegin={0}
                      animationDuration={1500}
                    />
                    <Bar
                      dataKey="madya"
                      name="Madya"
                      fill="#EF4444"
                      stackId="a"
                      radius={[4, 4, 0, 0]}
                      animationBegin={0}
                      animationDuration={1500}
                    />
                    <Bar
                      dataKey="bhakti"
                      name="Bhakti"
                      fill="#F59E0B"
                      stackId="a"
                      radius={[4, 4, 0, 0]}
                      animationBegin={0}
                      animationDuration={1500}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full" onMouseLeave={onPieLeave}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statistics.jenjangPieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomizedLabel}
                        {...getPieSize()}
                        dataKey="value"
                        animationBegin={0}
                        animationDuration={300}
                        animationEasing="ease-out"
                        onMouseEnter={onPieEnter}
                        onMouseLeave={onPieLeave}
                      >
                        {statistics.jenjangPieData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={getCellColor(entry, index)}
                            style={{
                              transition:
                                "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                              transform:
                                activeIndex === index
                                  ? "translate(0, -4px) scale(1.03)"
                                  : "translate(0, 0) scale(1)",
                              transformOrigin: "center",
                              cursor: "pointer",
                              filter:
                                activeIndex === index
                                  ? `brightness(1.1) drop-shadow(0 0 8px ${entry.shadowColor})`
                                  : "brightness(1)",
                            }}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        content={<PieChartTooltip />}
                        wrapperStyle={{ outline: "none" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          ) : (
            <div className="h-64 sm:h-72 md:h-80 flex items-center justify-center">
              <div className="text-center">
                <div className="text-gray-400 text-4xl sm:text-5xl mb-3 sm:mb-4">
                  📊
                </div>
                <p className="text-gray-500 text-sm sm:text-base">
                  Data statistik belum tersedia
                </p>
                <p className="text-xs sm:text-sm text-gray-400 mt-1">
                  Tidak ada data anggota
                </p>
              </div>
            </div>
          )}

          <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
              <div className="text-xs sm:text-sm text-gray-500">
                <span className="font-medium">Total Data:</span>{" "}
                {statistics.angkatanData.length} angkatan
              </div>
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-500"></div>
                  <span className="text-xs sm:text-sm text-gray-600">Muda</span>
                </div>
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-500"></div>
                  <span className="text-xs sm:text-sm text-gray-600">
                    Madya
                  </span>
                </div>
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-xs sm:text-sm text-gray-600">
                    Bhakti
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatistikSection;
