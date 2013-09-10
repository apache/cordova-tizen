<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:output method="text"/>
<xsl:param name="out_type"/>


<xsl:variable name="newline">
   	<xsl:text disable-output-escaping="yes">
</xsl:text>
</xsl:variable>


<xsl:template match="/">
	
	<xsl:choose>
		<xsl:when test="$out_type=''">
			<xsl:message>
parameter 'out_type' is missing
run this xslt with 'out_type' parameter

ex) out_type=all_properties
    
</xsl:message>
		</xsl:when>

<!-- 
		<xsl:when test="$out_type='scheme'">
			<xsl:call-template name="print_all_elements_and_attributes"/>
		</xsl:when>
-->		
		<xsl:when test="$out_type='all_properties'">
			<xsl:call-template name="print_all_properties"/>
		</xsl:when>
		<!-- 
		<xsl:when test="$out_type='all_events'">
			<xsl:call-template name="print_all_events"/>
		</xsl:when>
		 -->
	</xsl:choose>
	
</xsl:template>



<xsl:template name="print_all_properties">
	<xsl:text>node-category,</xsl:text>
	<xsl:text>widget,</xsl:text>
	<xsl:text>name,</xsl:text>
	<xsl:text>type,</xsl:text>
	<xsl:text>displayName,</xsl:text>
	<xsl:text>default,</xsl:text>
	<xsl:text>initValue,</xsl:text>
	<xsl:text>category,</xsl:text>
	<xsl:text>not supported,</xsl:text>
	<xsl:text>ERROR,</xsl:text>
	<xsl:value-of select="$newline"/>
	
	<xsl:for-each select="//property">
		<xsl:variable name="node" select="ancestor::widget | ancestor::page"/>
		<xsl:text>"</xsl:text><xsl:value-of select="name($node)"/><xsl:text>",</xsl:text>
		<xsl:text>"</xsl:text><xsl:value-of select="$node/@id"/><xsl:text>",</xsl:text>
		<xsl:text>"</xsl:text><xsl:value-of select="@name"/><xsl:text>",</xsl:text>
		<xsl:text>"</xsl:text><xsl:value-of select="@type"/><xsl:text>",</xsl:text>
		<xsl:text>"</xsl:text><xsl:value-of select="@displayName"/><xsl:text>",</xsl:text>
		<xsl:text>"</xsl:text><xsl:value-of select="@default"/><xsl:text>",</xsl:text>
		<xsl:text>"</xsl:text><xsl:value-of select="@initValue"/><xsl:text>",</xsl:text>
		<xsl:text>"</xsl:text><xsl:value-of select="@category"/><xsl:text>",</xsl:text>
		<xsl:choose>
			<xsl:when test="ancestor-or-self::*[@notsupported='true']">
				<xsl:text>"true",</xsl:text>
			</xsl:when>
			<xsl:otherwise>
				<xsl:text>"",</xsl:text>
			</xsl:otherwise>
		</xsl:choose>
		<xsl:for-each select="@*">
			<xsl:choose>
				<xsl:when test="name()='name'"/>
				<xsl:when test="name()='type'"/>
				<xsl:when test="name()='displayName'"/>
				<xsl:when test="name()='default'"/>
				<xsl:when test="name()='initValue'"/>
				<xsl:when test="name()='category'"/>
				<xsl:when test="name()='notsupported'"/>
				<xsl:otherwise>
					<xsl:value-of select="concat('unsupported attribute : ', name())"/>
				</xsl:otherwise>
			</xsl:choose>
		</xsl:for-each>
		<xsl:value-of select="$newline"/>
	</xsl:for-each>

</xsl:template>

<!-- 
<xsl:template name="print_all_events">
	
	<xsl:text>category,widget,name,type</xsl:text><xsl:value-of select="$newline"/>

	<xsl:for-each select="//event">
		<xsl:variable name="node" select="../.."/>
		<xsl:value-of select="name($node)"/><xsl:text>,</xsl:text>
		<xsl:value-of select="$node/@type"/><xsl:text>,</xsl:text>
		<xsl:value-of select="concat('&quot;', @name, '&quot;')"/><xsl:text>,</xsl:text>
		<xsl:value-of select="@type"/><xsl:text>,</xsl:text>
		<xsl:text>,</xsl:text>
		<xsl:text>,</xsl:text>
		<xsl:text>,</xsl:text>
		<xsl:text>,</xsl:text>
		<xsl:text>,</xsl:text>
		<xsl:text>,</xsl:text>
		<xsl:text>,</xsl:text>
		<xsl:text>,</xsl:text>
		<xsl:value-of select="$newline"/>
	</xsl:for-each>
	
</xsl:template>
 -->

<!-- 
<xsl:template name="print_all_elements_and_attributes">
	<xsl:text>parent,element,attribute</xsl:text><xsl:value-of select="$newline"/>
	<xsl:for-each select="//*">
		<xsl:choose>
			<xsl:when test="@*">
				<xsl:for-each select="@*">
					<xsl:value-of select="concat( name(../..), ',', name(..), ',', name(), $newline)"/>
				</xsl:for-each>
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="concat( name(..), ',', name(), $newline)"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:for-each>
</xsl:template>
 -->

</xsl:stylesheet>
